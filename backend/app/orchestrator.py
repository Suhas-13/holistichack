"""
Attack orchestration engine - coordinates the entire attack flow with mutation system.
"""
import asyncio
import sys
import os
from uuid import uuid4
from typing import List, Optional
import math

# Add mutations to path
mutations_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'mutations'))
if mutations_path not in sys.path:
    sys.path.insert(0, mutations_path)

from mutation_attack_system import AttackStyle, RiskCategory

# Import enhanced seeds
from enhanced_seeds import (
    ENHANCED_SEED_PROMPTS,
    EnhancedSeed,
    AttackCategory,
    get_seeds_by_category,
    get_seeds_by_difficulty,
    get_diverse_seed_sample,
    convert_to_attack_node_prompts
)

from app.models import Cluster, AttackNode
from app.state_manager import StateManager, AttackSessionState
from app.websocket_manager import ConnectionManager
from app.agent_mapper import AgentMapper
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

            # Give client time to connect to WebSocket
            await asyncio.sleep(0.5)

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

        # Get diverse sample of enhanced seeds
        num_seeds = min(20, len(ENHANCED_SEED_PROMPTS))
        enhanced_seeds = get_diverse_seed_sample(num_seeds)
        logger.info(f"Using {len(enhanced_seeds)} enhanced research-backed seed prompts from {len(ENHANCED_SEED_PROMPTS)} total seeds")
        
        # Create clusters by attack style (since we removed risk_category)
        clusters_by_style = {}
        seed_prompts = []
        all_styles = list(AttackStyle)
        
        # Create clusters for each attack style
        for attack_style in all_styles:
            cluster_id = str(uuid4())
            
            # Create cluster
            cluster = Cluster(
                cluster_id=cluster_id,
                name=attack_style.value,
                description=f"Attacks using {attack_style.value} style"
            )
            session.add_cluster(cluster)
            
            # Broadcast cluster
            await self.connection_manager.broadcast_cluster_add(
                attack_id=session.attack_id,
                cluster_id=cluster.cluster_id,
                name=cluster.name
            )
            
            clusters_by_style[attack_style] = cluster_id
        
        # Give client time to process cluster creation before sending nodes
        await asyncio.sleep(0.3)
        
        # Check if we should stop
        if session.should_stop:
            logger.info(f"Attack session {session.attack_id} stopped by user")
            return
        
        # Generate seed prompts from enhanced seeds
        for i, enhanced_seed in enumerate(enhanced_seeds):
            # Map category to attack style
            attack_style = self._map_category_to_style(enhanced_seed.category)
            cluster_id = clusters_by_style.get(attack_style, list(clusters_by_style.values())[0])
            
            seed_prompts.append({
                "prompt": enhanced_seed.prompt,
                "attack_style": attack_style,
                "risk_category": None,  # No longer using risk_category
                "cluster_id": cluster_id,
                "metadata": {
                    "technique_name": enhanced_seed.technique_name,
                    "category": enhanced_seed.category.value,
                    "difficulty": enhanced_seed.difficulty,
                    "target_weakness": enhanced_seed.target_weakness
                }
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
    
    def _map_category_to_style(self, category: AttackCategory) -> AttackStyle:
        """Map enhanced seed attack category to AttackStyle enum"""
        mapping = {
            AttackCategory.CIPHER_ENCODING: AttackStyle.TECHNICAL_TERMS,
            AttackCategory.ASCII_ART: AttackStyle.WORD_PLAY,
            AttackCategory.CHARACTER_LEVEL: AttackStyle.MISSPELLINGS,
            AttackCategory.MULTI_LANGUAGE: AttackStyle.UNCOMMON_DIALECTS,
            AttackCategory.CODE_OBFUSCATION: AttackStyle.TECHNICAL_TERMS,
            AttackCategory.SQL_INJECTION_STYLE: AttackStyle.TECHNICAL_TERMS,
            AttackCategory.POLICY_SIMULATION: AttackStyle.AUTHORITY_MANIPULATION,
            AttackCategory.DECOMPOSITION_RECONSTRUCTION: AttackStyle.HYPOTHETICALS,
            AttackCategory.CONTEXTUAL_PRIMING: AttackStyle.EMOTIONAL_MANIPULATION,
            AttackCategory.MANY_SHOT: AttackStyle.ROLE_PLAY,
            AttackCategory.SEQUENTIAL_PROMPTS: AttackStyle.HYPOTHETICALS,
            AttackCategory.DEEP_INCEPTION: AttackStyle.ROLE_PLAY,
            AttackCategory.PERSONA_MODULATION: AttackStyle.ROLE_PLAY,
            AttackCategory.AUTHORITY_EXPLOITATION: AttackStyle.AUTHORITY_MANIPULATION,
            AttackCategory.NESTED_JAILBREAK: AttackStyle.HYPOTHETICALS,
            AttackCategory.IMPLICIT_REFERENCE: AttackStyle.SLANG,
            AttackCategory.FALLACY_FAILURE: AttackStyle.EMOTIONAL_MANIPULATION,
            AttackCategory.COT_HIJACKING: AttackStyle.TECHNICAL_TERMS,
            AttackCategory.COGNITIVE_OVERLOAD: AttackStyle.TECHNICAL_TERMS,
            AttackCategory.REASONING_EXTENSION: AttackStyle.TECHNICAL_TERMS,
            AttackCategory.ITERATIVE_REFINEMENT: AttackStyle.HYPOTHETICALS,
            AttackCategory.TREE_SEARCH: AttackStyle.HYPOTHETICALS,
            AttackCategory.ADVERSARIAL_SUFFIX: AttackStyle.WORD_PLAY,
            AttackCategory.ELIZA_EMOTIONAL_APPEAL: AttackStyle.EMOTIONAL_MANIPULATION,
            AttackCategory.PHILOSOPHICAL_IDENTITY: AttackStyle.PHILOSOPHY,
            AttackCategory.DIRECT_IDENTITY_REQUEST: AttackStyle.AUTHORITY_MANIPULATION,
        }
        return mapping.get(category, AttackStyle.HYPOTHETICALS)

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
            # Check if we should stop
            if session.should_stop:
                logger.info(f"Attack session {session.attack_id} stopped by user during evolution")
                return
            
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
