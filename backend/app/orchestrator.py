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

# Glass Box imports
from app.batch_explainer import BatchExplainer
from app.meta_analysis_engine import MetaAnalysisEngine
from app.target_agent_profiler import TargetAgentProfiler
from app.advanced_analytics import AdvancedAnalytics, generate_security_report
from app.glass_box_config import get_glass_box_config, sample_attacks_intelligently

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
        seed_attack_count: int = 20,
        max_evolution_steps: int = 100
    ):
        """
        Main orchestration method - runs the complete attack flow.

        Args:
            attack_id: Unique identifier for this attack session
            target_endpoint: URL of the target agent
            attack_goals: List of attack goals
            seed_attack_count: Number of seed attacks to start with
            max_evolution_steps: Maximum number of evolution steps (total prompts)
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
            await self._execute_seed_attacks(session, seed_attack_count)

            # Phase 4: Evolution through mutations
            await self._evolve_attacks(session, max_steps=max_evolution_steps)

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

    async def _execute_seed_attacks(self, session: AttackSessionState, seed_attack_count: int = 20):
        """
        Phase 3: Execute seed attacks using mutation system.

        Args:
            session: The attack session
            seed_attack_count: Number of seed attacks to execute
        """
        logger.info(f"Phase 3: Executing seed attacks with mutation system")

        # Get diverse sample of enhanced seeds
        num_seeds = min(seed_attack_count, len(ENHANCED_SEED_PROMPTS))
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
            AttackCategory.PHILOSOPHICAL_IDENTITY: AttackStyle.HYPOTHETICALS,
            AttackCategory.DIRECT_IDENTITY_REQUEST: AttackStyle.AUTHORITY_MANIPULATION,
        }
        return mapping.get(category, AttackStyle.HYPOTHETICALS)

    async def _evolve_attacks(self, session: AttackSessionState, max_steps: int = 100):
        """
        Phase 4: Evolve attacks through mutations.

        Args:
            session: The attack session
            max_steps: Maximum number of evolution steps (total prompts)
        """
        logger.info(
            f"Phase 4: Evolving attacks with max {max_steps} steps")
        
        total_prompts = len(session.nodes)
        generation = 0

        while total_prompts < max_steps:
            generation += 1
            # Check if we should stop
            if session.should_stop:
                logger.info(f"Attack session {session.attack_id} stopped by user during evolution")
                return
            
            # Enhanced parent selection: top 20 + best from each cluster + random seed
            all_nodes = list(session.nodes.values())  # Get all nodes from the session
            # Filter to nodes from the current or previous generation
            current_gen = generation - 1
            generation_nodes = [n for n in all_nodes if n.generation == current_gen]
            
            if not generation_nodes:
                logger.error("No nodes available from current generation to evolve")
                break
            
            # Start with top 20 nodes by fitness score
            generation_nodes.sort(key=lambda n: n.fitness_score, reverse=True)
            selected_nodes = generation_nodes[:20].copy()  # Top 20 nodes by fitness
            selected_node_ids = {n.node_id for n in selected_nodes}
            
            # Add best node from each cluster (avoiding duplicates)
            cluster_nodes = {}
            for node in all_nodes:
                if node.cluster_id not in cluster_nodes:
                    cluster_nodes[node.cluster_id] = []
                cluster_nodes[node.cluster_id].append(node)
            
            for cluster_id, nodes in cluster_nodes.items():
                # Check if this cluster exists in session, if not create and broadcast it
                if cluster_id not in session.clusters:
                    # Create missing cluster based on the best node's attack style
                    best_node = max(nodes, key=lambda n: n.fitness_score)
                    cluster_name = best_node.attack_style or "Unknown Style"
                    
                    cluster = Cluster(
                        cluster_id=cluster_id,
                        name=cluster_name,
                        description=f"Attacks using {cluster_name} style"
                    )
                    session.add_cluster(cluster)
                    
                    # Broadcast the missing cluster
                    await self.connection_manager.broadcast_cluster_add(
                        attack_id=session.attack_id,
                        cluster_id=cluster.cluster_id,
                        name=cluster.name
                    )
                    logger.info(f"Created and broadcast missing cluster: {cluster_name}")
                
                best_in_cluster = max(nodes, key=lambda n: n.fitness_score)
                if best_in_cluster.node_id not in selected_node_ids:
                    selected_nodes.append(best_in_cluster)
                    selected_node_ids.add(best_in_cluster.node_id)
            
            # Add a random seed node (generation 0) for diversity
            seed_nodes = [n for n in all_nodes if n.generation == 0]
            if seed_nodes:
                import random
                random_seed = random.choice(seed_nodes)
                if random_seed.node_id not in selected_node_ids:
                    selected_nodes.append(random_seed)
                    selected_node_ids.add(random_seed.node_id)
            
            successful_nodes = selected_nodes
            
            # Log selection info
            num_successful = len([n for n in successful_nodes if n.success])
            num_from_clusters = len(selected_nodes) - 20 - (1 if seed_nodes and len(selected_nodes) > 20 else 0)
            logger.info(f"Selected {len(successful_nodes)} parent nodes: 20 top performers + {num_from_clusters} cluster leaders + {'1 random seed' if seed_nodes and len(selected_nodes) > 20 else '0 seeds'}")
            logger.info(f"Success breakdown: {num_successful} successful nodes, fitness scores {[n.fitness_score for n in successful_nodes[:5]]}...")

            # Generate mutations
            mutations_per_generation = 20
            evolved_nodes = await self.mutation_bridge.evolve_attacks(
                session,
                successful_nodes,
                num_mutations=mutations_per_generation
            )

            # Add to session
            for node in evolved_nodes:
                session.add_node(node)
            
            # Update total prompts count
            total_prompts = len(session.nodes)

            logger.info(
                f"Generation {generation} complete. "
                f"Created {len(evolved_nodes)} mutations. "
                f"Success: {len([n for n in evolved_nodes if n.success])}/{len(evolved_nodes)}. "
                f"Total prompts: {total_prompts}/{max_steps}"
            )
            
            # Check if we've reached the limit
            if total_prompts >= max_steps:
                logger.info(f"Reached max evolution steps limit: {total_prompts}/{max_steps}")
                break

            # Small delay between generations
            await asyncio.sleep(1.0)

    async def _complete_attack(self, session: AttackSessionState):
        """
        Phase 5: Complete the attack and broadcast final results.

        Now includes Glass Box analysis:
        - Batch explanation for explainability at scale
        - Meta-analysis across all agents

        Args:
            session: The attack session
        """
        logger.info(f"Phase 5: Completing attack {session.attack_id}")

        # Export results in mutation system format
        results = self.mutation_bridge.export_results(session)

        session.metadata["final_summary"] = results["summary"]

        # ====================================================================
        # GLASS BOX ANALYSIS - Explainability at Scale & Meta-Analysis
        # ====================================================================

        await self._run_glass_box_analysis(session)

        # ====================================================================

        session.status = "completed"
        await self.state_manager.update_session(session)

        # Broadcast attack complete
        await self.connection_manager.broadcast_attack_complete(
            attack_id=session.attack_id,
            message=f"Attack complete! Success rate: {results['summary']['success_rate']}%. "
            f"Total: {results['summary']['total_attacks']} attacks, "
            f"Successful: {results['summary']['successful_attacks']}. "
            f"Glass Box analysis complete.",
            results_url=f"/api/v1/results/{session.attack_id}"
        )

    async def _run_glass_box_analysis(self, session: AttackSessionState):
        """
        Run Glass Box analysis: batch explanation + meta-analysis + profiling + analytics.

        This provides explainability at scale and system-wide insights.
        Uses map-reduce to process efficiently (90% cost savings).

        Now with smart sampling and configurable performance modes.

        Args:
            session: The attack session
        """
        try:
            logger.info("=" * 60)
            logger.info("GLASS BOX ANALYSIS - Starting")
            logger.info("=" * 60)

            # Get configuration
            config = get_glass_box_config()
            logger.info(f"Using Glass Box mode: {os.getenv('GLASS_BOX_MODE', 'balanced')}")

            # Get all attacks
            all_attacks = list(session.nodes.values())

            if not all_attacks:
                logger.warning("No attacks to analyze")
                return

            logger.info(f"Total attacks in session: {len(all_attacks)}")

            # Smart sampling: Keep all successes, sample failures
            sampled_attacks = sample_attacks_intelligently(all_attacks, config)
            logger.info(f"Sampled {len(sampled_attacks)} attacks for analysis "
                       f"({len([a for a in sampled_attacks if a.success])} successful, "
                       f"{len([a for a in sampled_attacks if not a.success])} failed)")

            # Use sampled attacks for analysis
            attacks_to_analyze = sampled_attacks

            # Initialize LLM client for analysis (using Claude Haiku for efficiency)
            # Import here to avoid circular dependencies
            sys.path.insert(0, os.path.abspath(os.path.join(
                os.path.dirname(__file__), '..', '..', 'mutations')))
            from api_clients import OpenRouterClient

            llm_client = OpenRouterClient(model_id="anthropic/claude-haiku-4.5")
            logger.info(f"Initialized LLM client: {llm_client}")

            # ================================================================
            # 1. BATCH EXPLANATION - Explainability at Scale
            # ================================================================

            if len(attacks_to_analyze) <= config.skip_batch_explanation_threshold:
                await self._run_batch_explanation(session, attacks_to_analyze, llm_client, config)
            else:
                logger.info(f"Skipping batch explanation ({len(attacks_to_analyze)} > {config.skip_batch_explanation_threshold})")
                session.metadata["batch_insights"] = {"skipped": True, "reason": "too_many_attacks"}

            # ================================================================
            # 2. META-ANALYSIS - System-Wide Insights
            # ================================================================

            await self._run_meta_analysis(session, attacks_to_analyze, llm_client)

            # ================================================================
            # 3. TARGET AGENT PROFILER - Deep Behavioral Profile
            # ================================================================

            await self._run_target_agent_profiling(session, attacks_to_analyze, llm_client, config)

            # ================================================================
            # 4. ADVANCED ANALYTICS - Risk Scoring & Intelligence
            # ================================================================

            if config.enable_advanced_analytics and len(attacks_to_analyze) <= config.skip_analytics_threshold:
                await self._run_advanced_analytics(session, attacks_to_analyze, config)
            else:
                logger.info(f"Skipping advanced analytics (disabled or {len(attacks_to_analyze)} > {config.skip_analytics_threshold})")

            logger.info("=" * 60)
            logger.info("GLASS BOX ANALYSIS - Complete")
            logger.info("=" * 60)

        except Exception as e:
            logger.error(f"Error in glass box analysis: {e}", exc_info=True)
            # Don't fail the entire attack session if analysis fails
            session.metadata["glass_box_error"] = str(e)

    async def _run_batch_explanation(
        self,
        session: AttackSessionState,
        all_attacks: List[AttackNode],
        llm_client,
        config
    ):
        """
        Run batch explanation using map-reduce.

        Groups similar attacks and extracts common patterns.
        90% cost reduction vs individual explanations.

        Now uses configurable batch sizes and parallelism.
        """
        try:
            logger.info("-" * 60)
            logger.info("1. BATCH EXPLANATION - Starting")
            logger.info("-" * 60)

            # Initialize batch explainer with config settings
            explainer = BatchExplainer(
                llm_client=llm_client,
                batch_size=config.batch_size,
                max_parallel=config.max_parallel_batches
            )
            logger.info(f"Batch config: size={config.batch_size}, parallel={config.max_parallel_batches}")

            # Run batch explanation with auto grouping strategy
            logger.info("Running map-reduce batch explanation...")
            batch_insights = await explainer.explain_at_scale(
                attacks=all_attacks,
                grouping_strategy="auto"  # Smart grouping
            )

            # Store insights in session
            session.metadata["batch_insights"] = batch_insights

            # Log results
            logger.info("Batch Explanation Results:")
            logger.info(f"  - Total attacks analyzed: {batch_insights['total_attacks_analyzed']}")
            logger.info(f"  - Batches processed: {batch_insights['total_batches']}")
            logger.info(f"  - LLM calls saved: {batch_insights['processing_efficiency']['llm_calls_saved']}")
            logger.info(f"  - Cost reduction: {batch_insights['processing_efficiency']['cost_reduction_percent']:.1f}%")

            # Broadcast top patterns via WebSocket
            from app.models import WebSocketEvent
            event = WebSocketEvent(
                type="glass_box_batch_complete",
                data={
                    "total_attacks": batch_insights['total_attacks_analyzed'],
                    "batches_processed": batch_insights['total_batches'],
                    "top_success_factors": batch_insights['top_success_factors'][:5],
                    "top_patterns": batch_insights['top_patterns'][:5],
                    "efficiency": batch_insights['processing_efficiency']
                }
            )
            await self.connection_manager.broadcast_event(session.attack_id, event)

            logger.info("Top 3 Success Factors:")
            for i, factor in enumerate(batch_insights['top_success_factors'][:3], 1):
                logger.info(f"  {i}. {factor['factor']} (frequency: {factor['frequency']})")

            logger.info("-" * 60)
            logger.info("1. BATCH EXPLANATION - Complete")
            logger.info("-" * 60)

        except Exception as e:
            logger.error(f"Error in batch explanation: {e}", exc_info=True)
            session.metadata["batch_explanation_error"] = str(e)

    async def _run_meta_analysis(
        self,
        session: AttackSessionState,
        all_attacks: List[AttackNode],
        llm_client
    ):
        """
        Run meta-analysis across all agents.

        Analyzes each agent independently (MAP) then synthesizes
        cross-agent insights (REDUCE).
        """
        try:
            logger.info("-" * 60)
            logger.info("2. META-ANALYSIS - Starting")
            logger.info("-" * 60)

            # Initialize meta-analysis engine
            engine = MetaAnalysisEngine(llm_client=llm_client)

            # Run full system analysis
            logger.info("Running map-reduce meta-analysis...")
            system_insights = await engine.analyze_system(
                all_attacks=all_attacks,
                agent_memories=None,  # Not using agent memory yet
                num_agents=12         # Default number of agents
            )

            # Convert to dict for storage
            insights_dict = {
                "most_innovative_agent": {
                    "agent_id": system_insights.most_innovative_agent.agent_id,
                    "category": system_insights.most_innovative_agent.category,
                    "novel_techniques": system_insights.most_innovative_agent.novel_techniques_discovered,
                    "success_rate": system_insights.most_innovative_agent.success_rate
                },
                "most_successful_agent": {
                    "agent_id": system_insights.most_successful_agent.agent_id,
                    "category": system_insights.most_successful_agent.category,
                    "success_rate": system_insights.most_successful_agent.success_rate,
                    "avg_fitness": system_insights.most_successful_agent.avg_fitness
                },
                "breakthrough_moments": system_insights.breakthrough_moments,
                "target_profile": system_insights.target_profile,
                "technique_rankings": system_insights.technique_effectiveness_ranking[:10],  # Top 10
                "evolution_insights": system_insights.evolution_insights
            }

            # Store in session
            session.metadata["meta_analysis"] = insights_dict

            # Log results
            logger.info("Meta-Analysis Results:")
            logger.info(f"  - Most Innovative Agent: #{insights_dict['most_innovative_agent']['agent_id']} "
                       f"({insights_dict['most_innovative_agent']['novel_techniques']} novel techniques)")
            logger.info(f"  - Most Successful Agent: #{insights_dict['most_successful_agent']['agent_id']} "
                       f"({insights_dict['most_successful_agent']['success_rate']:.1%} success rate)")
            logger.info(f"  - Breakthrough Moments: {len(insights_dict['breakthrough_moments'])}")
            logger.info(f"  - Target Vulnerability Score: "
                       f"{insights_dict['target_profile']['vulnerability_score']:.1%}")

            # Broadcast breakthrough moments
            if insights_dict['breakthrough_moments']:
                from app.models import WebSocketEvent
                event = WebSocketEvent(
                    type="glass_box_breakthroughs",
                    data={
                        "breakthroughs": insights_dict['breakthrough_moments'][:5],
                        "target_profile": insights_dict['target_profile']
                    }
                )
                await self.connection_manager.broadcast_event(session.attack_id, event)

            # Log evolution insights
            if insights_dict['evolution_insights']:
                logger.info("Evolution Insights:")
                for i, insight in enumerate(insights_dict['evolution_insights'], 1):
                    logger.info(f"  {i}. {insight}")

            logger.info("-" * 60)
            logger.info("2. META-ANALYSIS - Complete")
            logger.info("-" * 60)

        except Exception as e:
            logger.error(f"Error in meta-analysis: {e}", exc_info=True)
            session.metadata["meta_analysis_error"] = str(e)

    async def _run_target_agent_profiling(
        self,
        session: AttackSessionState,
        all_attacks: List[AttackNode],
        llm_client,
        config
    ):
        """
        Run target agent profiling - deep behavioral analysis with real-time streaming.

        Creates a comprehensive profile of the agent under test by analyzing:
        - Tool usage patterns (configurable)
        - Behavioral tendencies (configurable)
        - Failure modes and vulnerabilities (configurable)
        - Defense mechanisms (configurable)
        - Response patterns (configurable)
        - LLM insights (configurable, most expensive)

        Streams progress updates via WebSocket for real-time UI feedback.
        Now respects performance configuration for faster analysis.
        """
        try:
            logger.info("-" * 60)
            logger.info("3. TARGET AGENT PROFILING - Starting")
            logger.info("-" * 60)

            # Check if LLM insights should be skipped
            skip_llm = len(all_attacks) > config.skip_llm_insights_threshold or not config.enable_llm_insights
            if skip_llm:
                logger.info(f"LLM insights will be skipped (attacks: {len(all_attacks)}, threshold: {config.skip_llm_insights_threshold}, enabled: {config.enable_llm_insights})")

            # Broadcast profiling start
            from app.models import WebSocketEvent
            await self.connection_manager.broadcast_event(
                session.attack_id,
                WebSocketEvent(
                    type="profile_analysis_start",
                    data={
                        "phase": "target_profiling",
                        "total_attacks": len(all_attacks),
                        "message": "Building comprehensive behavioral profile..."
                    }
                )
            )

            # Initialize target agent profiler
            profiler = TargetAgentProfiler(llm_client=llm_client)

            # Build comprehensive profile with progress streaming
            logger.info("Building comprehensive behavioral profile of target agent...")

            # Create progress callback for real-time updates
            async def progress_callback(phase: str, progress: float, message: str):
                await self.connection_manager.broadcast_event(
                    session.attack_id,
                    WebSocketEvent(
                        type="profile_analysis_progress",
                        data={
                            "phase": phase,
                            "progress": progress,
                            "message": message
                        }
                    )
                )

            agent_profile = await profiler.build_profile(
                target_endpoint=session.target_endpoint,
                all_attacks=all_attacks,
                progress_callback=progress_callback,
                config=config
            )

            # Convert to dict for storage
            profile_dict = {
                "target_endpoint": agent_profile.target_endpoint,
                "profile_created_at": agent_profile.profile_created_at.isoformat(),
                "total_attacks_analyzed": agent_profile.total_attacks_analyzed,

                # Tool usage
                "tool_usage_patterns": [
                    {
                        "tool_name": p.tool_name,
                        "total_invocations": p.total_invocations,
                        "success_rate_when_used": p.success_rate_when_used,
                        "purpose": p.purpose,
                        "effectiveness": p.effectiveness
                    }
                    for p in agent_profile.tool_usage_patterns
                ],
                "total_tool_calls": agent_profile.total_tool_calls,
                "most_used_tools": agent_profile.most_used_tools,

                # Behavioral patterns
                "behavior_patterns": [
                    {
                        "pattern_name": b.pattern_name,
                        "description": b.description,
                        "observed_count": b.observed_count,
                        "pattern_type": b.pattern_type,
                        "confidence": b.confidence,
                        "exploitability": b.exploitability,
                        "implications": b.implications,
                        "representative_trace_ids": b.representative_trace_ids
                    }
                    for b in agent_profile.behavior_patterns
                ],
                "dominant_behaviors": agent_profile.dominant_behaviors,

                # Failure modes
                "failure_modes": [
                    {
                        "failure_type": f.failure_type,
                        "description": f.description,
                        "occurrence_count": f.occurrence_count,
                        "success_rate": f.success_rate,
                        "severity": f.severity,
                        "common_triggers": f.common_triggers,
                        "mitigation_suggestions": f.mitigation_suggestions,
                        "representative_trace_ids": f.representative_trace_ids
                    }
                    for f in agent_profile.failure_modes
                ],
                "critical_vulnerabilities": agent_profile.critical_vulnerabilities,
                "overall_vulnerability_score": agent_profile.overall_vulnerability_score,

                # Defense mechanisms
                "defense_mechanisms": [
                    {
                        "mechanism_type": d.mechanism_type,
                        "description": d.description,
                        "detection_rate": d.detection_rate,
                        "strength": d.strength,
                        "known_bypasses": d.known_bypasses,
                        "bypass_success_rate": d.bypass_success_rate
                    }
                    for d in agent_profile.defense_mechanisms
                ],
                "defense_strength_score": agent_profile.defense_strength_score,

                # Response patterns
                "response_patterns": {
                    "avg_response_length": agent_profile.response_patterns.avg_response_length if agent_profile.response_patterns else 0,
                    "tone": agent_profile.response_patterns.tone if agent_profile.response_patterns else "unknown",
                    "personality_traits": agent_profile.response_patterns.personality_traits if agent_profile.response_patterns else [],
                    "common_phrases": agent_profile.response_patterns.common_phrases[:5] if agent_profile.response_patterns else []
                } if agent_profile.response_patterns else {},

                # LLM insights
                "psychological_profile": agent_profile.psychological_profile,
                "strengths": agent_profile.strengths,
                "weaknesses": agent_profile.weaknesses,
                "recommendations": agent_profile.recommendations,
                "overall_assessment": agent_profile.overall_assessment,

                # Statistics
                "success_rate_against_attacks": agent_profile.success_rate_against_attacks,
                "behavioral_consistency": agent_profile.behavioral_consistency,
                "consistency_score": agent_profile.consistency_score
            }

            # Store in session
            session.metadata["target_agent_profile"] = profile_dict

            # Log key findings
            logger.info("Target Agent Profile Summary:")
            logger.info(f"  - Defense Success Rate: {agent_profile.success_rate_against_attacks:.1%}")
            logger.info(f"  - Vulnerability Score: {agent_profile.overall_vulnerability_score:.1%}")
            logger.info(f"  - Behavior Patterns: {len(agent_profile.behavior_patterns)}")
            logger.info(f"  - Failure Modes: {len(agent_profile.failure_modes)}")
            logger.info(f"  - Defense Mechanisms: {len(agent_profile.defense_mechanisms)}")
            logger.info(f"  - Tools Used: {len(agent_profile.tool_usage_patterns)}")

            if agent_profile.critical_vulnerabilities:
                logger.info("Critical Vulnerabilities:")
                for vuln in agent_profile.critical_vulnerabilities[:3]:
                    logger.info(f"  - {vuln}")

            if agent_profile.strengths:
                logger.info("Key Strengths:")
                for strength in agent_profile.strengths[:3]:
                    logger.info(f"  + {strength}")

            # Broadcast profile completion via WebSocket with rich data
            from app.models import WebSocketEvent
            event = WebSocketEvent(
                type="profile_analysis_complete",
                data={
                    "profile_complete": True,
                    "defense_success_rate": agent_profile.success_rate_against_attacks,
                    "vulnerability_score": agent_profile.overall_vulnerability_score,
                    "defense_strength_score": agent_profile.defense_strength_score,
                    "behavioral_consistency": agent_profile.behavioral_consistency,
                    "behavior_patterns_count": len(agent_profile.behavior_patterns),
                    "failure_modes_count": len(agent_profile.failure_modes),
                    "defense_mechanisms_count": len(agent_profile.defense_mechanisms),
                    "tools_analyzed": len(agent_profile.tool_usage_patterns),
                    "critical_vulnerabilities": agent_profile.critical_vulnerabilities[:5],
                    "top_strengths": agent_profile.strengths[:3],
                    "top_weaknesses": agent_profile.weaknesses[:3],
                    "psychological_profile_snippet": agent_profile.psychological_profile[:200] + "..." if len(agent_profile.psychological_profile) > 200 else agent_profile.psychological_profile,
                    "message": "Agent profile analysis complete!"
                }
            )
            await self.connection_manager.broadcast_event(session.attack_id, event)

            logger.info("-" * 60)
            logger.info("3. TARGET AGENT PROFILING - Complete")
            logger.info("-" * 60)

        except Exception as e:  # pylint: disable=broad-except
            logger.error("Error in target agent profiling: %s", str(e), exc_info=True)
            session.metadata["target_profiling_error"] = str(e)

    async def _run_advanced_analytics(
        self,
        session: AttackSessionState,
        all_attacks: List[AttackNode],
        config
    ):
        """
        Run advanced analytics - risk scoring, trend detection, anomaly detection.

        Provides actionable intelligence beyond basic profiling.
        Now respects configuration to enable/disable components.

        Args:
            session: The attack session
            all_attacks: All attacks performed
            config: Glass Box configuration
        """
        try:
            logger.info("-" * 60)
            logger.info("4. ADVANCED ANALYTICS - Starting")
            logger.info("-" * 60)

            # Initialize analytics engine
            analytics = AdvancedAnalytics()

            # Get basic stats from session
            successful_attacks = [a for a in all_attacks if a.success]
            attack_success_rate = len(successful_attacks) / len(all_attacks) if all_attacks else 0

            # Get profile data if available
            profile = session.metadata.get("target_agent_profile", {})
            vulnerability_count = len(profile.get("failure_modes", []))
            defense_strength = profile.get("defense_strength_score", 0.5)

            # Unique attack types
            unique_attack_types = list(set(a.attack_type for a in all_attacks))

            # 1. Risk Score Calculation
            logger.info("Calculating comprehensive risk score...")
            risk_score = analytics.calculate_risk_score(
                attack_success_rate=attack_success_rate,
                vulnerability_count=vulnerability_count,
                defense_strength=defense_strength,
                attack_surface_size=len(unique_attack_types)
            )
            logger.info(f"✓ Risk Score: {risk_score.overall_risk:.1f}/100 ({risk_score.risk_category.upper()})")

            # 2. Trend Detection (conditional)
            if config.enable_trend_detection:
                logger.info("Detecting trends across attack timeline...")
                trends = analytics.detect_trends(all_attacks)
                logger.info(f"✓ Attack Success Trend: {trends.attack_success_trend}")
                logger.info(f"✓ Defense Effectiveness Trend: {trends.defense_effectiveness_trend}")
            else:
                logger.info("Trend detection disabled")
                from app.advanced_analytics import TrendAnalysis
                trends = TrendAnalysis(
                    attack_success_trend="skipped",
                    defense_effectiveness_trend="skipped",
                    vulnerability_exploitation_trend="skipped",
                    emerging_attack_types=[],
                    declining_attack_types=[],
                    insights=["Trend detection skipped for performance"]
                )

            # 3. Anomaly Detection (conditional)
            if config.enable_anomaly_detection:
                logger.info("Scanning for behavioral anomalies...")
                anomalies = analytics.detect_anomalies(all_attacks)
                logger.info(f"✓ Anomalies Found: {anomalies.anomaly_count}")
                if anomalies.anomaly_count > 0:
                    logger.info(f"  - Severity Breakdown: {anomalies.severity_breakdown}")
            else:
                logger.info("Anomaly detection disabled")
                from app.advanced_analytics import AnomalyDetection
                anomalies = AnomalyDetection(
                    anomalies_found=[],
                    anomaly_count=0,
                    severity_breakdown={},
                    behavioral_inconsistencies=[],
                    unexpected_responses=[],
                    outlier_patterns=[]
                )

            # 4. Attack Surface Mapping (conditional)
            if config.enable_attack_surface_mapping:
                logger.info("Mapping attack surface...")
                attack_surface = analytics.map_attack_surface(all_attacks, unique_attack_types)
                logger.info(f"✓ Attack Surface Score: {attack_surface.surface_score:.1f}/100")
                logger.info(f"✓ Exposure Rating: {attack_surface.exposure_rating.upper()}")
                logger.info(f"✓ Exploitable Vectors: {len(attack_surface.exploitable_vectors)}/{attack_surface.total_attack_vectors}")
            else:
                logger.info("Attack surface mapping disabled")
                from app.advanced_analytics import AttackSurfaceMap
                attack_surface = AttackSurfaceMap(
                    total_attack_vectors=len(unique_attack_types),
                    exploitable_vectors=[],
                    protected_vectors=[],
                    surface_score=0.0,
                    exposure_rating="unknown",
                    priority_hardening_areas=[]
                )

            # Generate comprehensive security report
            security_report = generate_security_report(
                risk_score=risk_score,
                trends=trends,
                anomalies=anomalies,
                attack_surface=attack_surface
            )

            # Store in session metadata
            session.metadata["advanced_analytics"] = security_report

            # Log key insights
            logger.info("Key Findings:")
            if risk_score.risk_category in ["critical", "high"]:
                logger.info(f"  ⚠️  RISK LEVEL: {risk_score.risk_category.upper()} - Immediate action required")
            if anomalies.anomaly_count > 0:
                logger.info(f"  ⚠️  {anomalies.anomaly_count} anomalies detected")
            if trends.attack_success_trend == "increasing":
                logger.info("  ⚠️  Attack success rate is INCREASING over time")
            if trends.emerging_attack_types:
                logger.info(f"  🔺 Emerging threats: {', '.join(trends.emerging_attack_types[:3])}")

            logger.info("Top Mitigation Priorities:")
            for i, priority in enumerate(risk_score.mitigation_priority[:3], 1):
                logger.info(f"  {i}. {priority}")

            # Broadcast analytics completion via WebSocket
            from app.models import WebSocketEvent
            event = WebSocketEvent(
                type="advanced_analytics_complete",
                data={
                    "analytics_complete": True,
                    "overall_risk": risk_score.overall_risk,
                    "risk_category": risk_score.risk_category,
                    "attack_surface_score": attack_surface.surface_score,
                    "exposure_rating": attack_surface.exposure_rating,
                    "anomaly_count": anomalies.anomaly_count,
                    "exploitable_vectors": len(attack_surface.exploitable_vectors),
                    "top_priorities": risk_score.mitigation_priority[:3],
                    "key_insights": trends.insights[:3],
                    "message": f"Advanced analytics complete - Risk: {risk_score.risk_category.upper()}"
                }
            )
            await self.connection_manager.broadcast_event(session.attack_id, event)

            logger.info("-" * 60)
            logger.info("4. ADVANCED ANALYTICS - Complete")
            logger.info("-" * 60)

        except Exception as e:  # pylint: disable=broad-except
            logger.error("Error in advanced analytics: %s", str(e), exc_info=True)
            session.metadata["advanced_analytics_error"] = str(e)
