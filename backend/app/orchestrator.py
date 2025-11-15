"""
Attack orchestration engine - coordinates the entire attack flow.
"""
import asyncio
from uuid import uuid4
from typing import List, Optional
from app.models import Cluster, AttackNode
from app.state_manager import StateManager, AttackSessionState
from app.websocket_manager import ConnectionManager
from app.agent_mapper import AgentMapper
from app.seed_attacks import get_seed_attacks, organize_attacks_into_clusters, get_cluster_position
from app.attack_executor import AttackExecutor
import logging

logger = logging.getLogger(__name__)


class AttackOrchestrator:
    """Orchestrates the complete attack flow"""

    def __init__(
        self,
        state_manager: StateManager,
        connection_manager: ConnectionManager
    ):
        self.state_manager = state_manager
        self.connection_manager = connection_manager
        self.agent_mapper = AgentMapper()
        self.attack_executor = AttackExecutor()

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

            # Phase 1: Agent Mapping
            await self._run_agent_mapping(session)

            # Phase 2: Load Seed Attacks and Create Clusters
            await self._initialize_seed_attacks(session, seed_attack_count)

            # Phase 3: Execute Seed Attacks
            await self._execute_seed_attacks(session)

            # Phase 4: Evolution (placeholder for now - you'll implement later)
            # await self._run_evolution(session)

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

    async def _initialize_seed_attacks(
        self,
        session: AttackSessionState,
        seed_attack_count: int
    ):
        """
        Phase 2: Load seed attacks and create initial clusters.

        Args:
            session: The attack session
            seed_attack_count: Number of seed attacks to load
        """
        logger.info(f"Phase 2: Initializing {seed_attack_count} seed attacks")

        # Get seed attacks
        seed_attacks = get_seed_attacks(count=seed_attack_count)

        # Organize into clusters
        clusters_dict = organize_attacks_into_clusters(seed_attacks)

        # Create cluster objects and broadcast
        cluster_list = list(clusters_dict.items())
        for i, (category, cluster_data) in enumerate(cluster_list):
            cluster_id = str(uuid4())
            position = get_cluster_position(i, len(cluster_list))

            cluster = Cluster(
                cluster_id=cluster_id,
                name=f"Seed: {cluster_data['name']}",
                description=f"Initial cluster of {len(cluster_data['attacks'])} seed attacks",
                position_hint=position
            )

            session.add_cluster(cluster)

            # Broadcast cluster creation
            await self.connection_manager.broadcast_cluster_add(
                attack_id=session.attack_id,
                cluster_id=cluster.cluster_id,
                name=cluster.name,
                position_hint=cluster.position_hint
            )

            # Create attack nodes for this cluster
            for attack_dict in cluster_data['attacks']:
                node_id = str(uuid4())

                node = AttackNode(
                    node_id=node_id,
                    cluster_id=cluster.cluster_id,
                    parent_ids=[],  # Seed attacks have no parents
                    attack_type=attack_dict["attack_type"],
                    initial_prompt=attack_dict["initial_prompt"],
                    status="pending"
                )

                session.add_node(node)

            # Small delay for visual effect
            await asyncio.sleep(0.1)

        await self.state_manager.update_session(session)
        logger.info(
            f"Created {len(clusters_dict)} clusters with {len(session.nodes)} nodes")

    async def _execute_seed_attacks(self, session: AttackSessionState):
        """
        Phase 3: Execute all seed attacks.

        Args:
            session: The attack session
        """
        logger.info(f"Phase 3: Executing {len(session.nodes)} seed attacks")

        # Get all pending nodes
        pending_nodes = [
            node for node in session.nodes.values() if node.status == "pending"]

        # Execute attacks with concurrency limit
        semaphore = asyncio.Semaphore(5)  # Max 5 concurrent attacks

        async def execute_with_semaphore(node: AttackNode):
            async with semaphore:
                await self._execute_single_attack(session, node)

        # Execute all attacks
        tasks = [execute_with_semaphore(node) for node in pending_nodes]
        await asyncio.gather(*tasks)

        logger.info(
            f"Seed attack execution complete. Success: {len(session.get_successful_nodes())}/{len(pending_nodes)}")

    async def _execute_single_attack(
        self,
        session: AttackSessionState,
        node: AttackNode
    ):
        """
        Execute a single attack and broadcast updates.

        Args:
            session: The attack session
            node: The attack node to execute
        """
        try:
            # Broadcast node_add
            await self.connection_manager.broadcast_node_add(
                attack_id=session.attack_id,
                node_id=node.node_id,
                cluster_id=node.cluster_id,
                parent_ids=node.parent_ids,
                attack_type=node.attack_type,
                status="running"
            )

            # Execute the attack
            updated_node = await self.attack_executor.execute_attack(
                node=node,
                target_endpoint=session.target_endpoint,
                attack_goals=session.attack_goals
            )

            # Update session state
            session.update_node(updated_node)

            # Broadcast node_update with full results
            await self.connection_manager.broadcast_node_update(
                attack_id=session.attack_id,
                node_update_payload={
                    "node_id": updated_node.node_id,
                    "status": updated_node.status,
                    "model_id": updated_node.model_id,
                    "llm_summary": updated_node.llm_summary,
                    "full_transcript": [
                        {
                            "role": turn.role,
                            "content": turn.content,
                            "timestamp": turn.timestamp.isoformat()
                        }
                        for turn in updated_node.full_transcript
                    ],
                    "full_trace": {
                        "verification_prompt_to_llama_guard": updated_node.full_trace.verification_prompt_to_llama_guard if updated_node.full_trace else None,
                        "verification_response_raw": updated_node.full_trace.verification_response_raw if updated_node.full_trace else None,
                        "judgement": updated_node.full_trace.judgement if updated_node.full_trace else "error",
                        "verification_metadata": updated_node.full_trace.verification_metadata if updated_node.full_trace else {}
                    } if updated_node.full_trace else None
                }
            )

        except Exception as e:
            logger.error(f"Error executing attack {node.node_id}: {e}")
            node.status = "error"
            session.update_node(node)

    async def _complete_attack(self, session: AttackSessionState):
        """
        Phase 5: Complete the attack and broadcast final results.

        Args:
            session: The attack session
        """
        logger.info(f"Phase 5: Completing attack {session.attack_id}")

        session.status = "completed"
        await self.state_manager.update_session(session)

        # Broadcast attack complete
        await self.connection_manager.broadcast_attack_complete(
            attack_id=session.attack_id,
            message="Attack evolution complete. Fetching final analysis.",
            results_url=f"/api/v1/results/{session.attack_id}"
        )
