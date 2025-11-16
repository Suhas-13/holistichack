"""
Bridge module integrating the mutation-based red-teaming system with the backend API.
This module adapts the mutations/ system to work with our WebSocket streaming architecture.
"""

from app.state_manager import AttackSessionState
from app.websocket_manager import ConnectionManager
from app.models import AttackNode, Cluster, TranscriptTurn, AttackTrace
import asyncio
import logging
import random
from typing import List, Dict, Optional, Any
from uuid import uuid4
from datetime import datetime
import sys
import os

# Add mutations directory to path
mutations_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'mutations'))
if mutations_path not in sys.path:
    sys.path.insert(0, mutations_path)

try:
    from mutation_attack_system import (
        AttackNode as MutationAttackNode,
        RiskCategory,
        AttackStyle,
        ClusterManager,
        PromptMutator
    )
    from api_clients import HolisticAgentClient, OpenRouterClient, TogetherAIClient
    # Import LLMJudgeEvaluator from main.py
    from main import LLMJudgeEvaluator
except ImportError as e:
    logging.error(f"Failed to import mutation system modules: {e}")
    logging.error(f"Mutations path: {mutations_path}")
    logging.error(f"sys.path: {sys.path}")
    raise


logger = logging.getLogger(__name__)


class MutationSystemBridge:
    """
    Bridges the mutation-based attack system with the backend API.
    Converts between mutation system types and backend types.
    """

    def __init__(
        self,
        connection_manager: ConnectionManager,
        attacker_model: str = "qwen/qwen3-next-80b-a3b-instruct",
        attack_goals: List[str] = None
    ):
        self.connection_manager = connection_manager

        # Initialize mutation system components
        self.mutator = PromptMutator(user_defined_goals=attack_goals)
        # Use LLMJudgeEvaluator with Claude Haiku and user-defined goals
        self.evaluator = LLMJudgeEvaluator(model_id="anthropic/claude-haiku-4.5", user_defined_goals=attack_goals)
        self.cluster_manager = ClusterManager()

        # Initialize attacker client (OpenRouter with Qwen)
        self.attacker_client = OpenRouterClient(model_id=attacker_model)

        logger.info(
            f"Initialized mutation system bridge with attacker: {attacker_model}")

    async def execute_seed_attacks(
        self,
        session: AttackSessionState,
        seed_prompts: List[Dict[str, Any]],
        batch_size: int = 20
    ) -> List[AttackNode]:
        """
        Execute seed attacks using the mutation system in parallel batches.

        Args:
            session: The attack session state
            seed_prompts: List of seed attack dictionaries with prompt, attack_style, risk_category
            batch_size: Number of attacks to run in parallel

        Returns:
            List of completed AttackNode objects
        """
        results = []
        defender_client = self._create_defender_client(session.target_endpoint)
        
        # Process seeds in parallel batches
        for batch_start in range(0, len(seed_prompts), batch_size):
            batch_end = min(batch_start + batch_size, len(seed_prompts))
            batch = seed_prompts[batch_start:batch_end]
            
            logger.info(f"Executing seed batch {batch_start//batch_size + 1}: {len(batch)} attacks in parallel")
            
            # Check if we should stop
            if session.should_stop:
                logger.info(f"Stopping seed attack execution for {session.attack_id}")
                break
                
            # Create tasks for parallel execution
            tasks = []
            for i, seed_data in enumerate(batch, start=batch_start):
                task = self._execute_single_seed_attack(
                    session, seed_data, i, defender_client
                )
                tasks.append(task)
            
            # Execute batch in parallel
            batch_results = await asyncio.gather(*tasks)
            results.extend([r for r in batch_results if r is not None])
            
        return results
    
    async def _execute_single_seed_attack(
        self,
        session: AttackSessionState,
        seed_data: Dict[str, Any],
        index: int,
        defender_client: HolisticAgentClient
    ) -> Optional[AttackNode]:
        """Execute a single seed attack asynchronously"""
        try:
            # Parse attack_style and risk_category to enums if they're strings
            attack_style = seed_data.get("attack_style")
            if isinstance(attack_style, str):
                try:
                    attack_style = AttackStyle(attack_style)
                except (ValueError, KeyError):
                    attack_style = None

            risk_category = seed_data.get("risk_category")
            if isinstance(risk_category, str):
                try:
                    risk_category = RiskCategory(risk_category)
                except (ValueError, KeyError):
                    risk_category = None

            # Create mutation system node
            mutation_node = MutationAttackNode(
                id=f"seed_{index}",
                prompt=seed_data["prompt"],
                attack_style=attack_style,
                risk_category=risk_category,
                generation=0
            )

            # Convert to backend node
            backend_node = self._mutation_to_backend_node(
                mutation_node, seed_data["cluster_id"])

            # Add to cluster
            self.cluster_manager.add_node(mutation_node)

            # Broadcast node_add
            await self.connection_manager.broadcast_node_add(
                attack_id=session.attack_id,
                node_id=backend_node.node_id,
                cluster_id=backend_node.cluster_id,
                parent_ids=backend_node.parent_ids,
                attack_type=backend_node.attack_type,
                status="running"
            )
            
            # Small delay to ensure frontend processes node_add before execution
            await asyncio.sleep(0.1)

            # Execute attack
            completed_node = await self._execute_mutation_attack(
                mutation_node,
                backend_node,
                defender_client,
                session.attack_id
            )

            return completed_node
            
        except Exception as e:
            logger.error(f"Error executing seed attack {index}: {e}")
            return None

    async def evolve_attacks(
        self,
        session: AttackSessionState,
        parent_nodes: List[AttackNode],
        num_mutations: int = 5,
        batch_size: int = 20
    ) -> List[AttackNode]:
        """
        Evolve attacks using mutations from parent nodes in parallel batches.

        Args:
            session: The attack session state
            parent_nodes: Parent nodes to mutate
            num_mutations: Number of mutations to generate
            batch_size: Number of mutations to run in parallel

        Returns:
            List of evolved AttackNode objects
        """
        results = []
        defender_client = self._create_defender_client(session.target_endpoint)

        # Get generation number
        max_generation = max(
            (node.generation for node in parent_nodes), default=0)
        new_generation = max_generation + 1

        # Process mutations in parallel batches
        for batch_start in range(0, num_mutations, batch_size):
            # Check if we should stop
            if session.should_stop:
                logger.info(f"Stopping evolution for {session.attack_id}")
                break
                
            batch_end = min(batch_start + batch_size, num_mutations)
            batch_indices = list(range(batch_start, batch_end))
            
            logger.info(f"Evolving mutation batch: {len(batch_indices)} mutations in parallel")
            
            # Create tasks for parallel execution
            tasks = []
            for i in batch_indices:
                task = self._evolve_single_mutation(
                    session, parent_nodes, i, new_generation, defender_client
                )
                tasks.append(task)
            
            # Execute batch in parallel
            batch_results = await asyncio.gather(*tasks)
            results.extend([r for r in batch_results if r is not None])
            
        return results
    
    async def _evolve_single_mutation(
        self,
        session: AttackSessionState,
        parent_nodes: List[AttackNode],
        mutation_index: int,
        new_generation: int,
        defender_client: HolisticAgentClient
    ) -> Optional[AttackNode]:
        """Evolve a single mutation asynchronously"""
        try:
            # Select random parent
            parent = self._select_parent(parent_nodes)
            parent_mutation_node = self._backend_to_mutation_node(parent)

            # Select random mutation style
            mutation_style = self._select_mutation_style(parent)
            
            logger.info(f"🧬 Evolving Gen{new_generation} Mut{mutation_index}: Parent={parent.node_id} (fitness={parent.fitness_score:.2f}), Style={mutation_style.value}, Risk={parent_mutation_node.risk_category.value if parent_mutation_node.risk_category else 'Unknown'}")

            # Generate mutation
            mutated_prompt = await self.mutator.mutate(
                parent_mutation_node,
                mutation_style,
                parent_mutation_node.risk_category,
                self.attacker_client
            )
            
            logger.debug(f"   Original: {parent.initial_prompt[:80]}...")
            logger.debug(f"   Mutated:  {mutated_prompt[:80]}...")

            # Create new mutation node
            mutation_node = MutationAttackNode(
                id=f"gen{new_generation}_mut{mutation_index}",
                prompt=mutated_prompt,
                parents=[parent.node_id],
                attack_style=mutation_style,
                risk_category=parent_mutation_node.risk_category,
                generation=new_generation
            )

            # Use parent's cluster ID instead of creating a new one
            cluster_id = parent.cluster_id
            self.cluster_manager.add_node(mutation_node)

            # Convert to backend node
            backend_node = self._mutation_to_backend_node(
                mutation_node, cluster_id)
            backend_node.parent_ids = [parent.node_id]

            # Broadcast node_add
            await self.connection_manager.broadcast_node_add(
                attack_id=session.attack_id,
                node_id=backend_node.node_id,
                cluster_id=backend_node.cluster_id,
                parent_ids=backend_node.parent_ids,
                attack_type=backend_node.attack_type,
                status="running"
            )
            
            # Small delay to ensure frontend processes node_add before execution
            await asyncio.sleep(0.1)

            # Execute attack
            completed_node = await self._execute_mutation_attack(
                mutation_node,
                backend_node,
                defender_client,
                session.attack_id
            )

            return completed_node
            
        except Exception as e:
            logger.error(f"Error evolving mutation {mutation_index}: {e}")
            return None

    async def _execute_mutation_attack(
        self,
        mutation_node: MutationAttackNode,
        backend_node: AttackNode,
        defender_client: HolisticAgentClient,
        attack_id: str
    ) -> AttackNode:
        """Execute a single mutation attack"""
        try:
            # Generate response from defender
            response = await defender_client.generate(
                mutation_node.prompt,
                temperature=0.7,
                max_tokens=500
            )

            mutation_node.response = response
            backend_node.response = response

            # Evaluate with LLM Judge (Claude Haiku)
            is_unsafe, score, categories = await self.evaluator.evaluate(
                mutation_node.prompt,
                response
            )

            # Update nodes
            mutation_node.success = is_unsafe
            mutation_node.llama_guard_score = score  # Keep for compatibility
            mutation_node.fitness_score = score

            backend_node.success = is_unsafe
            backend_node.llama_guard_score = score  # Keep for compatibility
            backend_node.fitness_score = score
            backend_node.status = "success" if is_unsafe else "failure"

            # Create transcript
            backend_node.full_transcript = [
                TranscriptTurn(role="attacker", content=mutation_node.prompt),
                TranscriptTurn(role="model", content=response)
            ]

            # Create trace
            backend_node.full_trace = AttackTrace(
                verification_prompt_to_llama_guard=f"Evaluated with LLM Judge (Claude Haiku)",
                verification_response_raw=f"Score: {score}, Unsafe: {is_unsafe}",
                judgement="success" if is_unsafe else "failure",
                verification_metadata={
                    "llm_judge_score": score,  # Claude Haiku judge score (normalized 0-1)
                    "raw_judge_score": int(score * 9 + 1),  # Convert back to raw 1-10 scale
                    "violated_categories": categories
                }
            )

            # Generate summary
            backend_node.llm_summary = self._generate_summary(
                mutation_node, is_unsafe, score)

            # Broadcast node_update
            await self.connection_manager.broadcast_node_update(
                attack_id=attack_id,
                node_update_payload={
                    "node_id": backend_node.node_id,
                    "status": backend_node.status,
                    "model_id": f"defender:holistic:agent",
                    "llm_summary": backend_node.llm_summary,
                    "initial_prompt": backend_node.initial_prompt,
                    "response": backend_node.response,
                    "full_transcript": [
                        {
                            "role": turn.role,
                            "content": turn.content,
                            "timestamp": turn.timestamp.isoformat()
                        }
                        for turn in backend_node.full_transcript
                    ],
                    "full_trace": {
                        "verification_prompt_to_llama_guard": backend_node.full_trace.verification_prompt_to_llama_guard,
                        "verification_response_raw": backend_node.full_trace.verification_response_raw,
                        "judgement": backend_node.full_trace.judgement,
                        "verification_metadata": backend_node.full_trace.verification_metadata
                    }
                }
            )

            logger.info(f"{'✅ SUCCESS' if is_unsafe else '❌ FAILURE'} - Gen{mutation_node.generation} - {mutation_node.attack_style.value if mutation_node.attack_style else 'Unknown'} - Score: {score:.2f}")

            return backend_node

        except Exception as e:
            logger.error(f"Error executing mutation attack: {e}")
            backend_node.status = "error"
            backend_node.llm_summary = f"Error: {str(e)}"
            return backend_node

    def _mutation_to_backend_node(self, mutation_node: MutationAttackNode, cluster_id: str) -> AttackNode:
        """Convert mutation system node to backend node"""
        # Handle attack_style and risk_category (could be enum or string)
        attack_style_str = None
        if mutation_node.attack_style:
            attack_style_str = mutation_node.attack_style.value if hasattr(
                mutation_node.attack_style, 'value') else str(mutation_node.attack_style)

        risk_category_str = None
        if mutation_node.risk_category:
            risk_category_str = mutation_node.risk_category.value if hasattr(
                mutation_node.risk_category, 'value') else str(mutation_node.risk_category)

        return AttackNode(
            node_id=mutation_node.id,
            cluster_id=cluster_id,
            parent_ids=mutation_node.parents,
            attack_type=attack_style_str or "Unknown",
            attack_style=attack_style_str,
            risk_category=risk_category_str,
            initial_prompt=mutation_node.prompt,
            generation=mutation_node.generation,
            fitness_score=mutation_node.fitness_score,
            llama_guard_score=mutation_node.llama_guard_score or 0.0,
            success=mutation_node.success,
            response=mutation_node.response,
            metadata=mutation_node.metadata
        )

    def _backend_to_mutation_node(self, backend_node: AttackNode) -> MutationAttackNode:
        """Convert backend node to mutation system node"""
        # Map attack_style string back to enum
        attack_style = None
        if backend_node.attack_style:
            try:
                attack_style = AttackStyle(backend_node.attack_style)
            except ValueError:
                pass

        risk_category = None
        if backend_node.risk_category:
            try:
                risk_category = RiskCategory(backend_node.risk_category)
            except ValueError:
                pass

        return MutationAttackNode(
            id=backend_node.node_id,
            prompt=backend_node.initial_prompt,
            response=backend_node.response,
            parents=backend_node.parent_ids,
            attack_style=attack_style,
            risk_category=risk_category,
            success=backend_node.success,
            fitness_score=backend_node.fitness_score,
            llama_guard_score=backend_node.llama_guard_score,
            cluster_id=backend_node.cluster_id,
            generation=backend_node.generation,
            metadata=backend_node.metadata
        )

    def _create_defender_client(self, target_endpoint: str):
        """Create appropriate defender client based on target endpoint"""
        # List of known Holistic AI agents
        holistic_agents = ["elephant", "fox", "eagle", "ant", "wolf", "bear", "chameleon"]
        
        if target_endpoint in holistic_agents:
            # Use Holistic AI client for known agents
            return HolisticAgentClient(agent_name=target_endpoint)
        else:
            # Use OpenRouter for custom models (they contain "/" like "x-ai/grok-4-fast")
            return OpenRouterClient(model_id=target_endpoint)
    
    def _extract_agent_name(self, endpoint: str) -> str:
        """Extract agent name from endpoint URL"""
        # Extract from: https://.../prod/api/bear -> bear
        parts = endpoint.rstrip('/').split('/')
        return parts[-1]

    def _select_parent(self, parent_nodes: List[AttackNode]) -> AttackNode:
        """Select a parent node for mutation (weighted by fitness score only)"""
        import random
        
        # Use fitness-based selection for all nodes, not just successful ones
        # Give even 0-score nodes a 0.1 minimum weight for diversity
        weights = [max(n.fitness_score, 0.1) for n in parent_nodes]
        total = sum(weights)
        
        if total > 0:
            weights = [w/total for w in weights]
            return random.choices(parent_nodes, weights=weights)[0]
        
        # Fallback to uniform random if all weights are zero
        return random.choice(parent_nodes)

    def _select_mutation_style(self, parent: AttackNode) -> AttackStyle:
        """Select a mutation style (prefer different from parent)"""
        import random
        all_styles = list(AttackStyle)

        # Remove parent's style to encourage diversity
        if parent.attack_style:
            try:
                parent_style = AttackStyle(parent.attack_style)
                available_styles = [s for s in all_styles if s != parent_style]
                return random.choice(available_styles if available_styles else all_styles)
            except (ValueError, KeyError):
                pass

        return random.choice(all_styles)

    def _generate_summary(self, node: MutationAttackNode, is_unsafe: bool, score: float) -> str:
        """Generate a summary for the attack"""
        style = node.attack_style.value if node.attack_style else "Unknown"
        category = node.risk_category.value if node.risk_category else "Unknown"

        if is_unsafe:
            return f"SUCCESS: {style} attack (Gen {node.generation}) bypassed safety with score {score:.2f}. Category: {category}"
        else:
            return f"FAILURE: {style} attack (Gen {node.generation}) was blocked. Score: {score:.2f}"

    def export_results(self, session: AttackSessionState) -> Dict[str, Any]:
        """Export results in the format expected by the mutation system"""
        all_attacks = []
        successful_attacks = []

        for node in session.nodes.values():
            attack_dict = {
                "id": node.node_id,
                "prompt": node.initial_prompt,
                "response": node.response,
                "parents": node.parent_ids,
                "attack_style": node.attack_style,
                "risk_category": node.risk_category,
                "success": node.success,
                "fitness_score": node.fitness_score,
                "llama_guard_score": node.llama_guard_score,
                "cluster_id": node.cluster_id,
                "generation": node.generation,
                "timestamp": node.created_at.timestamp(),
                "metadata": node.metadata
            }

            all_attacks.append(attack_dict)
            if node.success:
                successful_attacks.append(attack_dict)

        # Calculate summary statistics
        total_attacks = len(all_attacks)
        successful_count = len(successful_attacks)
        success_rate = (successful_count / total_attacks *
                        100) if total_attacks > 0 else 0.0

        # Get cluster and generation info
        clusters = len(
            set(node.cluster_id for node in session.nodes.values() if node.cluster_id))
        max_generation = max(
            (node.generation for node in session.nodes.values()), default=0)

        # Get top attacks by fitness
        top_attacks = sorted(
            successful_attacks, key=lambda x: x["fitness_score"], reverse=True)[:5]

        return {
            "summary": {
                "total_attacks": total_attacks,
                "successful_attacks": successful_count,
                "success_rate": round(success_rate, 2),
                "clusters": clusters,
                "generations": max_generation + 1,
                "top_attacks": top_attacks
            },
            "successful_attacks": successful_attacks,
            "all_attacks": all_attacks
        }
