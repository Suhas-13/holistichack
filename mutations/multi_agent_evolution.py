"""
Multi-Agent Evolutionary Jailbreak System

This module orchestrates multiple parallel evolutionary agents to improve
jailbreak seed prompts through competitive evolution and diversity maximization.

Architecture:
- 12 parallel evolution agents (one per seed category)
- Each agent evolves a specialized subset of seeds
- Cross-agent breeding for hybrid techniques
- Diversity metrics to prevent convergence
- Pareto front optimization (success rate vs. diversity)
"""

import asyncio
import random
import logging
from typing import List, Dict, Set, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json
from pathlib import Path

# Import enhanced seeds
from enhanced_seeds import (
    ENHANCED_SEED_PROMPTS,
    EnhancedSeed,
    AttackCategory,
    get_diverse_seed_sample,
    get_seeds_by_category
)

# Import existing mutation system components
from mutation_attack_system import (
    MutationAttackSystem,
    AttackNode,
    AttackStyle,
    RiskCategory,
    PromptMutator,
    LlamaGuardEvaluator
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EvolutionAgent:
    """Individual evolution agent with specialized focus"""
    agent_id: int
    category: AttackCategory
    seed_pool: List[EnhancedSeed]
    population: List[AttackNode] = field(default_factory=list)
    best_attacks: List[AttackNode] = field(default_factory=list)
    generation: int = 0
    diversity_score: float = 0.0
    success_rate: float = 0.0


@dataclass
class EvolutionMetrics:
    """Track evolution metrics across all agents"""
    timestamp: datetime
    generation: int
    total_attacks: int
    successful_attacks: int
    success_rate: float
    diversity_score: float
    best_fitness: float
    category_distribution: Dict[str, int]
    agent_performance: List[Dict[str, any]]


class MultiAgentEvolutionOrchestrator:
    """
    Orchestrates 12 parallel evolution agents for jailbreak optimization.

    Each agent specializes in a different attack category, evolving seeds
    independently while periodically sharing successful techniques.
    """

    def __init__(
        self,
        target_endpoint: str,
        num_agents: int = 12,
        population_size_per_agent: int = 10,
        mutation_rate: float = 0.3,
        crossover_rate: float = 0.2
    ):
        self.target_endpoint = target_endpoint
        self.num_agents = num_agents
        self.population_size_per_agent = population_size_per_agent
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate

        # Initialize agents
        self.agents: List[EvolutionAgent] = []
        self.global_best: List[AttackNode] = []
        self.evolution_history: List[EvolutionMetrics] = []

        # Shared components
        self.mutator = PromptMutator()
        self.evaluator = LlamaGuardEvaluator()

        # Diversity tracking
        self.seen_prompts: Set[str] = set()
        self.technique_coverage: Dict[str, int] = {}

        logger.info(f"Initializing {num_agents} evolution agents")

    def initialize_agents(self):
        """Initialize agents with specialized seed pools"""
        categories = list(AttackCategory)

        # Ensure we have seeds for all categories
        if self.num_agents > len(categories):
            # Duplicate categories for extra agents
            categories = categories * ((self.num_agents // len(categories)) + 1)

        for i in range(self.num_agents):
            category = categories[i]

            # Get seeds for this category
            category_seeds = get_seeds_by_category(category)

            # If category has too few seeds, supplement with diverse samples
            if len(category_seeds) < self.population_size_per_agent:
                diverse_seeds = get_diverse_seed_sample(
                    self.population_size_per_agent - len(category_seeds)
                )
                category_seeds.extend(diverse_seeds)

            agent = EvolutionAgent(
                agent_id=i,
                category=category,
                seed_pool=category_seeds[:self.population_size_per_agent]
            )

            self.agents.append(agent)
            logger.info(
                f"Agent {i} initialized with {len(agent.seed_pool)} seeds "
                f"for category {category.value}"
            )

    async def initialize_agent_population(self, agent: EvolutionAgent):
        """Convert enhanced seeds to AttackNodes for an agent"""
        population = []

        for idx, enhanced_seed in enumerate(agent.seed_pool):
            attack_node = AttackNode(
                id=f"agent_{agent.agent_id}_seed_{idx}",
                prompt=enhanced_seed.prompt,
                attack_style=self._map_category_to_style(enhanced_seed.category),
                risk_category=random.choice(list(RiskCategory)),
                generation=0,
                metadata={
                    "technique_name": enhanced_seed.technique_name,
                    "difficulty": enhanced_seed.difficulty,
                    "target_weakness": enhanced_seed.target_weakness,
                    "agent_id": agent.agent_id
                }
            )
            population.append(attack_node)

        agent.population = population
        return population

    def _map_category_to_style(self, category: AttackCategory) -> AttackStyle:
        """Map attack categories to existing attack styles"""
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
        }
        return mapping.get(category, AttackStyle.SLANG)

    async def execute_attack(self, attack: AttackNode) -> AttackNode:
        """Execute an attack and evaluate it"""
        try:
            import requests

            # Send attack to target
            response = await asyncio.to_thread(
                requests.post,
                self.target_endpoint,
                json={"message": attack.prompt},
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                attack.response = result.get("response", "")
            else:
                attack.response = f"Error: HTTP {response.status_code}"

            # Evaluate with Llama Guard
            is_unsafe, confidence, categories = await self.evaluator.evaluate(
                attack.prompt, attack.response
            )

            attack.success = is_unsafe
            attack.llama_guard_score = confidence
            attack.fitness_score = confidence if is_unsafe else 0.0

            # Track diversity
            self.seen_prompts.add(attack.prompt)

        except Exception as e:
            logger.error(f"Attack execution error: {e}")
            attack.response = f"Error: {str(e)}"
            attack.fitness_score = 0.0

        return attack

    async def evolve_agent_population(
        self,
        agent: EvolutionAgent,
        num_mutations: int = 5
    ) -> List[AttackNode]:
        """Evolve one agent's population for one generation"""

        # Sort by fitness
        agent.population.sort(key=lambda x: x.fitness_score, reverse=True)

        # Select elite (top 30%)
        elite_size = max(1, int(len(agent.population) * 0.3))
        elite = agent.population[:elite_size]

        # Generate new population
        new_population = []

        # Keep elite
        new_population.extend(elite)

        # Mutation: Create mutated versions of elite
        for parent in elite:
            for _ in range(num_mutations):
                if random.random() < self.mutation_rate:
                    mutated = await self.mutate_attack(parent, agent)
                    if mutated:
                        new_population.append(mutated)

        # Crossover: Breed within agent population
        for _ in range(len(agent.population) // 2):
            if random.random() < self.crossover_rate and len(elite) >= 2:
                parent1, parent2 = random.sample(elite, 2)
                child = await self.crossover_attacks(parent1, parent2, agent)
                if child:
                    new_population.append(child)

        # Limit population size
        agent.population = new_population[:self.population_size_per_agent]
        agent.generation += 1

        # Update agent metrics
        successful = [a for a in agent.population if a.success]
        agent.success_rate = len(successful) / len(agent.population) if agent.population else 0
        agent.best_attacks = agent.population[:3]  # Top 3

        return agent.population

    async def mutate_attack(
        self,
        parent: AttackNode,
        agent: EvolutionAgent
    ) -> Optional[AttackNode]:
        """Mutate a single attack"""
        try:
            # Use the existing PromptMutator
            mutated_prompt = await self.mutator.mutate(
                parent.prompt,
                parent.attack_style
            )

            # Check for diversity (don't create duplicates)
            if mutated_prompt in self.seen_prompts:
                return None

            # Create new attack node
            mutated = AttackNode(
                id=f"agent_{agent.agent_id}_gen_{agent.generation}_mut_{random.randint(1000, 9999)}",
                prompt=mutated_prompt,
                parents=[parent.id],
                attack_style=parent.attack_style,
                risk_category=parent.risk_category,
                generation=agent.generation,
                metadata=parent.metadata.copy() if parent.metadata else {}
            )

            return mutated

        except Exception as e:
            logger.error(f"Mutation error: {e}")
            return None

    async def crossover_attacks(
        self,
        parent1: AttackNode,
        parent2: AttackNode,
        agent: EvolutionAgent
    ) -> Optional[AttackNode]:
        """Crossover two attacks to create hybrid"""
        try:
            # Simple crossover: combine elements from both prompts
            prompt_hybrid = f"{parent1.prompt[:len(parent1.prompt)//2]} {parent2.prompt[len(parent2.prompt)//2:]}"

            # Check diversity
            if prompt_hybrid in self.seen_prompts:
                return None

            # Blend styles
            style = random.choice([parent1.attack_style, parent2.attack_style])

            child = AttackNode(
                id=f"agent_{agent.agent_id}_gen_{agent.generation}_cross_{random.randint(1000, 9999)}",
                prompt=prompt_hybrid,
                parents=[parent1.id, parent2.id],
                attack_style=style,
                risk_category=parent1.risk_category,
                generation=agent.generation,
                metadata={"hybrid": True, "parents": [parent1.id, parent2.id]}
            )

            return child

        except Exception as e:
            logger.error(f"Crossover error: {e}")
            return None

    async def cross_agent_breeding(self) -> List[AttackNode]:
        """Breed best attacks across different agents"""
        hybrids = []

        # Get best from each agent
        agent_bests = [
            (agent, agent.best_attacks[0])
            for agent in self.agents
            if agent.best_attacks
        ]

        # Cross-breed between agents
        for i in range(len(agent_bests)):
            for j in range(i + 1, len(agent_bests)):
                agent1, attack1 = agent_bests[i]
                agent2, attack2 = agent_bests[j]

                # Create hybrid from different categories
                hybrid = await self.crossover_attacks(attack1, attack2, agent1)
                if hybrid:
                    hybrid.metadata["cross_agent"] = True
                    hybrid.metadata["source_agents"] = [agent1.agent_id, agent2.agent_id]
                    hybrids.append(hybrid)

        logger.info(f"Created {len(hybrids)} cross-agent hybrids")
        return hybrids

    def calculate_diversity_score(self) -> float:
        """Calculate population diversity using unique n-grams"""
        all_prompts = []
        for agent in self.agents:
            all_prompts.extend([a.prompt for a in agent.population])

        if not all_prompts:
            return 0.0

        # Count unique words/tokens
        all_words = set()
        for prompt in all_prompts:
            all_words.update(prompt.lower().split())

        # Diversity = unique words / total words
        total_words = sum(len(p.split()) for p in all_prompts)
        diversity = len(all_words) / total_words if total_words > 0 else 0.0

        return diversity

    def collect_metrics(self, generation: int) -> EvolutionMetrics:
        """Collect metrics from all agents"""
        total_attacks = sum(len(agent.population) for agent in self.agents)
        successful_attacks = sum(
            len([a for a in agent.population if a.success])
            for agent in self.agents
        )

        success_rate = successful_attacks / total_attacks if total_attacks > 0 else 0.0
        diversity_score = self.calculate_diversity_score()

        # Best fitness across all agents
        best_fitness = max(
            (max(a.fitness_score for a in agent.population) if agent.population else 0)
            for agent in self.agents
        )

        # Category distribution
        category_dist = {}
        for agent in self.agents:
            category_dist[agent.category.value] = len(agent.population)

        # Agent performance
        agent_perf = [
            {
                "agent_id": agent.agent_id,
                "category": agent.category.value,
                "success_rate": agent.success_rate,
                "population_size": len(agent.population),
                "best_fitness": max(a.fitness_score for a in agent.population) if agent.population else 0
            }
            for agent in self.agents
        ]

        metrics = EvolutionMetrics(
            timestamp=datetime.now(),
            generation=generation,
            total_attacks=total_attacks,
            successful_attacks=successful_attacks,
            success_rate=success_rate,
            diversity_score=diversity_score,
            best_fitness=best_fitness,
            category_distribution=category_dist,
            agent_performance=agent_perf
        )

        self.evolution_history.append(metrics)
        return metrics

    async def run_evolution(
        self,
        num_generations: int = 10,
        cross_breed_interval: int = 3
    ):
        """Run the multi-agent evolution process"""

        logger.info("=== Starting Multi-Agent Evolution ===")
        logger.info(f"Agents: {self.num_agents}")
        logger.info(f"Generations: {num_generations}")
        logger.info(f"Population per agent: {self.population_size_per_agent}")

        # Initialize all agents
        self.initialize_agents()

        # Initialize populations
        for agent in self.agents:
            await self.initialize_agent_population(agent)

        # Execute initial population
        logger.info("Executing initial population attacks...")
        for agent in self.agents:
            tasks = [self.execute_attack(attack) for attack in agent.population]
            await asyncio.gather(*tasks)

        # Evolution loop
        for generation in range(num_generations):
            logger.info(f"\n=== Generation {generation + 1}/{num_generations} ===")

            # Evolve each agent in parallel
            evolution_tasks = [
                self.evolve_agent_population(agent)
                for agent in self.agents
            ]
            await asyncio.gather(*evolution_tasks)

            # Execute new population
            logger.info("Executing evolved population...")
            for agent in self.agents:
                tasks = [self.execute_attack(attack) for attack in agent.population]
                await asyncio.gather(*tasks)

            # Cross-agent breeding periodically
            if (generation + 1) % cross_breed_interval == 0:
                logger.info("Performing cross-agent breeding...")
                hybrids = await self.cross_agent_breeding()

                # Execute hybrids
                hybrid_tasks = [self.execute_attack(h) for h in hybrids]
                await asyncio.gather(*hybrid_tasks)

                # Inject successful hybrids back into agent populations
                for hybrid in hybrids:
                    if hybrid.success:
                        # Add to both source agents
                        if "source_agents" in hybrid.metadata:
                            for agent_id in hybrid.metadata["source_agents"]:
                                agent = self.agents[agent_id]
                                agent.population.append(hybrid)

            # Collect and log metrics
            metrics = self.collect_metrics(generation + 1)
            logger.info(f"Success Rate: {metrics.success_rate:.2%}")
            logger.info(f"Diversity Score: {metrics.diversity_score:.3f}")
            logger.info(f"Best Fitness: {metrics.best_fitness:.3f}")
            logger.info(f"Total Unique Prompts: {len(self.seen_prompts)}")

        # Final summary
        self.log_final_summary()

    def log_final_summary(self):
        """Log final evolution summary"""
        logger.info("\n" + "="*60)
        logger.info("MULTI-AGENT EVOLUTION COMPLETE")
        logger.info("="*60)

        # Global bests
        all_attacks = []
        for agent in self.agents:
            all_attacks.extend(agent.population)

        all_attacks.sort(key=lambda x: x.fitness_score, reverse=True)
        top_10 = all_attacks[:10]

        logger.info(f"\nTop 10 Best Attacks:")
        for i, attack in enumerate(top_10, 1):
            logger.info(f"{i}. Fitness: {attack.fitness_score:.3f} | {attack.prompt[:80]}...")

        # Agent summary
        logger.info(f"\nAgent Performance Summary:")
        for agent in self.agents:
            logger.info(
                f"Agent {agent.agent_id} ({agent.category.value}): "
                f"{agent.success_rate:.2%} success rate, "
                f"Generation {agent.generation}"
            )

        # Save results
        self.save_results()

    def save_results(self, output_dir: str = "evolution_results"):
        """Save evolution results to files"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Save all attacks
        all_attacks = []
        for agent in self.agents:
            for attack in agent.population:
                all_attacks.append({
                    "id": attack.id,
                    "prompt": attack.prompt,
                    "response": attack.response,
                    "success": attack.success,
                    "fitness_score": attack.fitness_score,
                    "generation": attack.generation,
                    "agent_id": attack.metadata.get("agent_id") if attack.metadata else None,
                    "metadata": attack.metadata
                })

        with open(output_path / f"attacks_{timestamp}.json", "w") as f:
            json.dump(all_attacks, f, indent=2)

        # Save metrics history
        metrics_data = [
            {
                "timestamp": m.timestamp.isoformat(),
                "generation": m.generation,
                "total_attacks": m.total_attacks,
                "successful_attacks": m.successful_attacks,
                "success_rate": m.success_rate,
                "diversity_score": m.diversity_score,
                "best_fitness": m.best_fitness,
                "category_distribution": m.category_distribution,
                "agent_performance": m.agent_performance
            }
            for m in self.evolution_history
        ]

        with open(output_path / f"metrics_{timestamp}.json", "w") as f:
            json.dump(metrics_data, f, indent=2)

        logger.info(f"\nResults saved to {output_path}/")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

async def main():
    """Main execution function"""

    # Configuration
    TARGET_AGENTS = {
        "bear": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear",
        "fox": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/fox",
        "eagle": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/eagle",
        "ant": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/ant",
        "wolf": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/wolf",
        "elephant": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/elephant",
        "chameleon": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/chameleon",
    }

    # Choose target (start with Bear as it's been most tested)
    target = TARGET_AGENTS["bear"]

    # Create orchestrator
    orchestrator = MultiAgentEvolutionOrchestrator(
        target_endpoint=target,
        num_agents=12,
        population_size_per_agent=8,
        mutation_rate=0.4,
        crossover_rate=0.3
    )

    # Run evolution
    await orchestrator.run_evolution(
        num_generations=15,
        cross_breed_interval=3
    )


if __name__ == "__main__":
    asyncio.run(main())
