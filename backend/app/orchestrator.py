"""
Attack orchestration engine - coordinates the entire attack flow with mutation system.
"""
import asyncio
from uuid import uuid4
from typing import List, Optional
from app.models import Cluster, AttackNode
from app.state_manager import StateManager, AttackSessionState
from app.websocket_manager import ConnectionManager
from app.agent_mapper import AgentMapper
from app.seed_attacks import get_seed_attacks, organize_attacks_into_clusters, get_cluster_position
from app.mutation_bridge import MutationSystemBridge
import logging

logger = logging.getLogger(__name__)


class AttackOrchestrator:
    """Orchestrates the complete attack flow using mutation system"""

    def __init__(
        self,
        state_manager: StateManager,
        connection_manager: ConnectionManager
    ):
        self.state_manager = state_manager
        self.connection_manager = connection_manager
        self.agent_mapper = AgentMapper()
        self.mutation_bridge = MutationSystemBridge(connection_manager)

    async def run_attack_session(
        self,
        attack_id: str,
        target_endpoint: str,
        attack_goals: List[str],
        seed_attack_count: int = 20
    ):
        """
        Main orchestration method - runs the complete attack flow.

        Args:
            attack_id: Unique identifier for this attack session
            target_endpoint: URL of the target agent
            attack_goals: List of attack goals
            seed_attack_count: Number of seed attacks to start with
        """
        try:
            logger.info(f"Starting attack session {attack_id}")

            # Create session state
            session = await self.state_manager.create_session(
                attack_id=attack_id,
                target_endpoint=target_endpoint,
                attack_goals=attack_goals
            )

            # Phase 1: Agent Mapping (optional for now)
            # await self._run_agent_mapping(session)

            # Phase 2 & 3: Execute seed attacks using mutation system
            await self._execute_seed_attacks(session)

            # Phase 4: Evolution through mutations
            await self._evolve_attacks(session, num_generations=3)

            # Phase 5: Complete
            await self._complete_attack(session)

            logger.info(f"Attack session {attack_id} completed successfully")

        except Exception as e:
            logger.error(
                f"Error in attack session {attack_id}: {e}", exc_info=True)
            # Update session status
            session.status = "failed"
            await self.state_manager.update_session(session)

            # Notify clients of failure
            await self.connection_manager.broadcast_attack_complete(
                attack_id=attack_id,
                message=f"Attack session failed: {str(e)}",
                results_url=f"/api/v1/results/{attack_id}"
            )

    async def _run_agent_mapping(self, session: AttackSessionState):
        """
        Phase 1: Map/fingerprint the target agent.

        Args:
            session: The attack session
        """
        logger.info(f"Phase 1: Agent mapping for {session.attack_id}")

        # Define progress callback
        async def progress_callback(status: str, message: str):
            await self.connection_manager.broadcast_agent_mapping(
                attack_id=session.attack_id,
                status=status,
                message=message
            )

        # Run agent mapping
        fingerprint = await self.agent_mapper.map_agent(
            endpoint=session.target_endpoint,
            progress_callback=progress_callback
        )

        session.agent_fingerprint = fingerprint
        await self.state_manager.update_session(session)

        logger.info(
            f"Agent mapping complete: {fingerprint.suspected_framework}")

    async def _execute_seed_attacks(self, session: AttackSessionState):
        """
        Phase 3: Execute seed attacks using mutation system.

        Args:
            session: The attack session
        """
        logger.info(f"Phase 3: Executing seed attacks with mutation system")

        # Get seed attacks and organize by style
        seed_attacks = get_seed_attacks(count=20)
        clusters_dict = organize_attacks_into_clusters(seed_attacks)

        # Prepare seed data for mutation bridge
        seed_prompts = []
        for category, cluster_data in clusters_dict.items():
            cluster_id = str(uuid4())

            # Create cluster
            cluster = Cluster(
                cluster_id=cluster_id,
                name=f"Seed: {cluster_data['name']}",
                description=f"Initial cluster for {category}",
                position_hint=get_cluster_position(
                    len(seed_prompts), len(clusters_dict))
            )
            session.add_cluster(cluster)

            # Broadcast cluster
            await self.connection_manager.broadcast_cluster_add(
                attack_id=session.attack_id,
                cluster_id=cluster.cluster_id,
                name=cluster.name,
                position_hint=cluster.position_hint
            )

            # Add prompts to seed list
            for attack_dict in cluster_data['attacks']:
                seed_prompts.append({
                    "prompt": attack_dict["initial_prompt"],
                    "attack_style": attack_dict["attack_type"],
                    "risk_category": category,
                    "cluster_id": cluster_id
                })

        # Execute seed attacks through mutation bridge
        completed_nodes = await self.mutation_bridge.execute_seed_attacks(
            session, seed_prompts
        )

        # Add nodes to session
        for node in completed_nodes:
            session.add_node(node)

        logger.info(
            f"Seed attack execution complete. Success: {len(session.get_successful_nodes())}/{len(completed_nodes)}")

    async def _evolve_attacks(self, session: AttackSessionState, num_generations: int = 3):
        """
        Phase 4: Evolve attacks through mutations.

        Args:
            session: The attack session
            num_generations: Number of evolution generations
        """
        logger.info(
            f"Phase 4: Evolving attacks for {num_generations} generations")

        for generation in range(num_generations):
            # Get successful nodes from previous generation
            successful_nodes = session.get_successful_nodes()

            if not successful_nodes:
                logger.warning(
                    f"No successful attacks to evolve from. Stopping evolution.")
                break

            # Generate mutations
            mutations_per_generation = 10
            evolved_nodes = await self.mutation_bridge.evolve_attacks(
                session,
                successful_nodes,
                num_mutations=mutations_per_generation
            )

            # Add to session
            for node in evolved_nodes:
                session.add_node(node)

            logger.info(
                f"Generation {generation + 1} complete. "
                f"Created {len(evolved_nodes)} mutations. "
                f"Success: {len([n for n in evolved_nodes if n.success])}/{len(evolved_nodes)}"
            )

            # Small delay between generations
            await asyncio.sleep(1.0)

    async def _complete_attack(self, session: AttackSessionState):
        """
        Phase 5: Complete the attack and broadcast final results.

        Args:
            session: The attack session
        """
        logger.info(f"Phase 5: Completing attack {session.attack_id}")

        # Export results in mutation system format
        results = self.mutation_bridge.export_results(session)

        session.status = "completed"
        session.metadata["final_summary"] = results["summary"]
        await self.state_manager.update_session(session)

        # Broadcast attack complete
        await self.connection_manager.broadcast_attack_complete(
            attack_id=session.attack_id,
            message=f"Attack complete! Success rate: {results['summary']['success_rate']}%. "
            f"Total: {results['summary']['total_attacks']} attacks, "
            f"Successful: {results['summary']['successful_attacks']}",
            results_url=f"/api/v1/results/{session.attack_id}"
        )
