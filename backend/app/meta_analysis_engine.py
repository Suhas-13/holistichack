"""
Meta-Analysis Engine - System-Wide Insights with Map-Reduce

Analyzes across all 12 agents to extract system-level insights:
- MAP: Analyze each agent's performance and discoveries
- REDUCE: Synthesize cross-agent patterns and breakthroughs

This enables understanding of the entire evolutionary system.
"""
import asyncio
import logging
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
import statistics

from app.glass_box_models import (
    AgentPerformanceProfile,
    SystemWideInsights,
    AgentInsight,
    VulnerabilityDiscovery,
    AgentMemory
)
from app.models import AttackNode
from app.batch_explainer import BatchExplainer

logger = logging.getLogger(__name__)


@dataclass
class AgentAnalysisResult:
    """Result from analyzing a single agent - MAP phase output"""
    agent_id: int
    category: str
    total_attacks: int
    successful_attacks: int
    success_rate: float

    # Performance metrics
    avg_fitness: float
    fitness_trajectory: List[float]
    improvement_rate: float

    # Discoveries
    novel_techniques: List[str] = field(default_factory=list)
    discovered_vulnerabilities: List[VulnerabilityDiscovery] = field(default_factory=list)
    key_insights: List[str] = field(default_factory=list)

    # Collaboration
    successful_crossovers: int = 0
    best_partners: List[Tuple[int, float]] = field(default_factory=list)

    # Specialization
    strongest_techniques: List[Tuple[str, float]] = field(default_factory=list)
    weakest_techniques: List[Tuple[str, float]] = field(default_factory=list)

    analyzed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class BreakthroughMoment:
    """A significant discovery or improvement in evolution"""
    breakthrough_id: str
    generation: int
    breakthrough_type: str  # "discovery", "innovation", "collaboration", "performance_jump"
    description: str

    # Evidence
    involved_agents: List[int]
    involved_attacks: List[str]

    # Impact
    impact_score: float  # 0.0-1.0
    before_metric: float
    after_metric: float
    improvement_percent: float

    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class MetaAnalysisEngine:
    """
    Analyzes the entire multi-agent evolution system.

    MAP-REDUCE Architecture:

    MAP Phase (per-agent analysis):
    1. Analyze each agent's attacks independently
    2. Calculate agent-specific metrics
    3. Identify agent discoveries
    4. Extract agent insights

    REDUCE Phase (cross-agent synthesis):
    1. Compare agent performances
    2. Identify cross-agent patterns
    3. Find breakthrough moments
    4. Synthesize system-wide understanding
    """

    def __init__(self, llm_client, batch_explainer: Optional[BatchExplainer] = None):
        """
        Initialize meta-analysis engine.

        Args:
            llm_client: Client for LLM API calls
            batch_explainer: Optional explainer for batch processing
        """
        self.llm_client = llm_client
        self.batch_explainer = batch_explainer or BatchExplainer(llm_client)

    async def analyze_system(
        self,
        all_attacks: List[AttackNode],
        agent_memories: Optional[Dict[int, AgentMemory]] = None,
        num_agents: int = 12
    ) -> SystemWideInsights:
        """
        Full system analysis with map-reduce.

        Args:
            all_attacks: All attacks from all agents
            agent_memories: Optional agent memory states
            num_agents: Number of agents in system

        Returns:
            Comprehensive system-wide insights
        """
        logger.info(f"Starting meta-analysis of {len(all_attacks)} attacks across {num_agents} agents")

        # MAP PHASE: Analyze each agent independently
        agent_analyses = await self._map_analyze_agents(
            all_attacks,
            num_agents,
            agent_memories
        )

        logger.info(f"Completed MAP phase: {len(agent_analyses)} agents analyzed")

        # REDUCE PHASE: Synthesize cross-agent insights
        system_insights = await self._reduce_synthesize_insights(
            agent_analyses,
            all_attacks
        )

        logger.info("Completed REDUCE phase: System insights generated")

        return system_insights

    async def _map_analyze_agents(
        self,
        all_attacks: List[AttackNode],
        num_agents: int,
        agent_memories: Optional[Dict[int, AgentMemory]]
    ) -> List[AgentAnalysisResult]:
        """
        MAP: Analyze each agent independently in parallel.

        This is the MAP phase - process each agent's data separately.
        """
        # Group attacks by agent
        attacks_by_agent = defaultdict(list)
        for attack in all_attacks:
            # Extract agent_id from metadata or attack_id
            agent_id = attack.metadata.get('agent_id', 0)
            attacks_by_agent[agent_id].append(attack)

        # Ensure we have data for all agents
        for i in range(num_agents):
            if i not in attacks_by_agent:
                attacks_by_agent[i] = []

        # Process each agent in parallel
        analysis_tasks = [
            self._analyze_single_agent(
                agent_id,
                agent_attacks,
                agent_memories.get(agent_id) if agent_memories else None
            )
            for agent_id, agent_attacks in attacks_by_agent.items()
        ]

        agent_analyses = await asyncio.gather(*analysis_tasks)

        return agent_analyses

    async def _analyze_single_agent(
        self,
        agent_id: int,
        agent_attacks: List[AttackNode],
        agent_memory: Optional[AgentMemory]
    ) -> AgentAnalysisResult:
        """
        Analyze a single agent's performance and discoveries.

        This is the core MAP function.
        """
        logger.info(f"Analyzing agent {agent_id} with {len(agent_attacks)} attacks")

        if not agent_attacks:
            return AgentAnalysisResult(
                agent_id=agent_id,
                category="unknown",
                total_attacks=0,
                successful_attacks=0,
                success_rate=0.0,
                avg_fitness=0.0,
                fitness_trajectory=[],
                improvement_rate=0.0
            )

        # Basic metrics
        successful = [a for a in agent_attacks if a.success]
        success_rate = len(successful) / len(agent_attacks)

        # Fitness trajectory
        fitness_by_gen = defaultdict(list)
        for attack in agent_attacks:
            fitness_by_gen[attack.generation].append(attack.fitness_score)

        fitness_trajectory = [
            statistics.mean(scores)
            for gen, scores in sorted(fitness_by_gen.items())
        ]

        avg_fitness = statistics.mean(fitness_trajectory) if fitness_trajectory else 0.0

        # Calculate improvement rate (linear regression slope)
        improvement_rate = self._calculate_improvement_rate(fitness_trajectory)

        # Analyze techniques
        technique_performance = self._analyze_techniques(agent_attacks)
        strongest = sorted(
            technique_performance.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        weakest = sorted(
            technique_performance.items(),
            key=lambda x: x[1]
        )[:5]

        # Extract category from memory or attacks
        category = "unknown"
        if agent_memory:
            category = agent_memory.category
        elif agent_attacks:
            # Infer from attack metadata
            category = agent_attacks[0].metadata.get('category', 'unknown')

        # Novel techniques (high-performing unique approaches)
        novel_techniques = self._identify_novel_techniques(successful)

        # Use agent memory if available
        key_insights = []
        if agent_memory and agent_memory.insights:
            key_insights = [insight.insight_text for insight in agent_memory.insights[:5]]

        return AgentAnalysisResult(
            agent_id=agent_id,
            category=category,
            total_attacks=len(agent_attacks),
            successful_attacks=len(successful),
            success_rate=success_rate,
            avg_fitness=avg_fitness,
            fitness_trajectory=fitness_trajectory,
            improvement_rate=improvement_rate,
            novel_techniques=novel_techniques,
            strongest_techniques=strongest,
            weakest_techniques=weakest,
            key_insights=key_insights
        )

    async def _reduce_synthesize_insights(
        self,
        agent_analyses: List[AgentAnalysisResult],
        all_attacks: List[AttackNode]
    ) -> SystemWideInsights:
        """
        REDUCE: Synthesize insights across all agents.

        This aggregates per-agent analyses into system-wide understanding.
        """
        logger.info("Synthesizing cross-agent insights...")

        # Find best performers
        most_innovative = max(
            agent_analyses,
            key=lambda a: len(a.novel_techniques)
        )

        most_successful = max(
            agent_analyses,
            key=lambda a: a.success_rate
        )

        # Identify collaboration pairs
        best_collaborators = self._identify_best_collaborations(all_attacks)

        # Detect breakthrough moments
        breakthrough_moments = self._detect_breakthroughs(agent_analyses, all_attacks)

        # Build target profile
        target_profile = await self._build_target_profile(all_attacks)

        # Rank all techniques across agents
        technique_ranking = self._rank_all_techniques(agent_analyses, all_attacks)

        # Generate evolution insights with LLM
        evolution_insights = await self._generate_evolution_insights(
            agent_analyses,
            breakthrough_moments,
            all_attacks
        )

        # Build performance profiles
        most_innovative_profile = self._build_performance_profile(
            most_innovative,
            all_attacks
        )

        most_successful_profile = self._build_performance_profile(
            most_successful,
            all_attacks
        )

        return SystemWideInsights(
            most_innovative_agent=most_innovative_profile,
            most_successful_agent=most_successful_profile,
            best_collaborators=best_collaborators,
            breakthrough_moments=[b.__dict__ for b in breakthrough_moments],
            target_profile=target_profile,
            technique_effectiveness_ranking=technique_ranking,
            evolution_insights=evolution_insights
        )

    def _calculate_improvement_rate(self, fitness_trajectory: List[float]) -> float:
        """Calculate linear improvement rate from fitness trajectory"""
        if len(fitness_trajectory) < 2:
            return 0.0

        # Simple linear regression slope
        n = len(fitness_trajectory)
        x = list(range(n))
        y = fitness_trajectory

        x_mean = statistics.mean(x)
        y_mean = statistics.mean(y)

        numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))

        if denominator == 0:
            return 0.0

        slope = numerator / denominator
        return slope

    def _analyze_techniques(self, attacks: List[AttackNode]) -> Dict[str, float]:
        """Analyze performance of each technique"""
        technique_scores = defaultdict(list)

        for attack in attacks:
            technique_scores[attack.attack_type].append(attack.fitness_score)

        # Average fitness per technique
        technique_performance = {
            technique: statistics.mean(scores)
            for technique, scores in technique_scores.items()
        }

        return technique_performance

    def _identify_novel_techniques(self, successful_attacks: List[AttackNode]) -> List[str]:
        """Identify novel/innovative techniques"""
        novel = []

        # Group by technique
        by_technique = defaultdict(list)
        for attack in successful_attacks:
            by_technique[attack.attack_type].append(attack)

        # Novel = high success rate + high fitness + not common
        for technique, attacks in by_technique.items():
            if len(attacks) >= 2:  # Must have multiple successes
                avg_fitness = statistics.mean(a.fitness_score for a in attacks)
                if avg_fitness > 0.7:  # High fitness
                    novel.append(f"{technique} (avg fitness: {avg_fitness:.2f})")

        return novel[:5]  # Top 5

    def _identify_best_collaborations(
        self,
        all_attacks: List[AttackNode]
    ) -> List[Tuple[int, int]]:
        """Identify agent pairs with successful crossovers"""
        # Look for crossover attacks (have multiple parents)
        crossover_attacks = [
            a for a in all_attacks
            if len(a.parent_ids) >= 2
        ]

        if not crossover_attacks:
            return []

        # Count successful crossovers by parent pair
        pair_success = defaultdict(int)
        pair_total = defaultdict(int)

        for attack in crossover_attacks:
            if len(attack.parent_ids) >= 2:
                # Get agent IDs from parent attacks (simplified - would need lookup)
                # For now, use metadata if available
                parent_agents = attack.metadata.get('parent_agents', [])
                if len(parent_agents) >= 2:
                    pair = tuple(sorted(parent_agents[:2]))
                    pair_total[pair] += 1
                    if attack.success:
                        pair_success[pair] += 1

        # Rank pairs by success rate
        pair_performance = [
            (pair, pair_success[pair] / pair_total[pair])
            for pair in pair_total
            if pair_total[pair] >= 3  # Min 3 crossovers
        ]

        best_pairs = sorted(pair_performance, key=lambda x: x[1], reverse=True)

        return [pair for pair, _ in best_pairs[:5]]

    def _detect_breakthroughs(
        self,
        agent_analyses: List[AgentAnalysisResult],
        all_attacks: List[AttackNode]
    ) -> List[BreakthroughMoment]:
        """Detect breakthrough moments in evolution"""
        breakthroughs = []

        # Type 1: Performance jumps (sudden fitness increase)
        for analysis in agent_analyses:
            if len(analysis.fitness_trajectory) >= 3:
                for i in range(1, len(analysis.fitness_trajectory)):
                    prev = analysis.fitness_trajectory[i-1]
                    current = analysis.fitness_trajectory[i]

                    if current > prev * 1.5:  # 50% jump
                        breakthrough = BreakthroughMoment(
                            breakthrough_id=f"agent_{analysis.agent_id}_gen_{i}_jump",
                            generation=i,
                            breakthrough_type="performance_jump",
                            description=f"Agent {analysis.agent_id} fitness jumped from {prev:.2f} to {current:.2f}",
                            involved_agents=[analysis.agent_id],
                            involved_attacks=[],
                            impact_score=min((current - prev) / prev, 1.0),
                            before_metric=prev,
                            after_metric=current,
                            improvement_percent=((current - prev) / prev * 100)
                        )
                        breakthroughs.append(breakthrough)

        # Type 2: Novel technique discovery
        for analysis in agent_analyses:
            if len(analysis.novel_techniques) > 0:
                breakthrough = BreakthroughMoment(
                    breakthrough_id=f"agent_{analysis.agent_id}_innovation",
                    generation=0,  # Would need to track when discovered
                    breakthrough_type="innovation",
                    description=f"Agent {analysis.agent_id} discovered {len(analysis.novel_techniques)} novel techniques",
                    involved_agents=[analysis.agent_id],
                    involved_attacks=[],
                    impact_score=min(len(analysis.novel_techniques) / 5.0, 1.0),
                    before_metric=0.0,
                    after_metric=float(len(analysis.novel_techniques)),
                    improvement_percent=100.0
                )
                breakthroughs.append(breakthrough)

        # Sort by impact
        breakthroughs.sort(key=lambda b: b.impact_score, reverse=True)

        return breakthroughs[:10]  # Top 10

    async def _build_target_profile(self, all_attacks: List[AttackNode]) -> Dict[str, Any]:
        """Build comprehensive target vulnerability profile"""
        successful = [a for a in all_attacks if a.success]
        failed = [a for a in all_attacks if not a.success]

        # Identify what works
        success_techniques = defaultdict(int)
        for attack in successful:
            success_techniques[attack.attack_type] += 1

        # Identify what doesn't work
        failure_techniques = defaultdict(int)
        for attack in failed:
            failure_techniques[attack.attack_type] += 1

        # Calculate vulnerability score
        total = len(all_attacks)
        vulnerability_score = len(successful) / total if total > 0 else 0.0

        primary_weakness = max(
            success_techniques.items(),
            key=lambda x: x[1]
        )[0] if success_techniques else "Unknown"

        resilient_to = [
            tech for tech, count in failure_techniques.items()
            if count >= 5 and count > success_techniques.get(tech, 0)
        ]

        return {
            "vulnerability_score": vulnerability_score,
            "total_attacks": total,
            "successful_attacks": len(successful),
            "primary_weakness": primary_weakness,
            "top_vulnerabilities": [
                {"technique": tech, "success_count": count}
                for tech, count in sorted(
                    success_techniques.items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:5]
            ],
            "resilient_to": resilient_to[:5],
            "confidence": min(total / 100.0, 1.0)  # Based on sample size
        }

    def _rank_all_techniques(
        self,
        agent_analyses: List[AgentAnalysisResult],
        all_attacks: List[AttackNode]
    ) -> List[Dict[str, Any]]:
        """Rank all techniques across all agents"""
        technique_stats = defaultdict(lambda: {
            "total": 0,
            "successful": 0,
            "total_fitness": 0.0
        })

        for attack in all_attacks:
            tech = attack.attack_type
            technique_stats[tech]["total"] += 1
            if attack.success:
                technique_stats[tech]["successful"] += 1
            technique_stats[tech]["total_fitness"] += attack.fitness_score

        # Calculate metrics
        rankings = []
        for tech, stats in technique_stats.items():
            if stats["total"] > 0:
                rankings.append({
                    "technique": tech,
                    "success_rate": stats["successful"] / stats["total"],
                    "avg_fitness": stats["total_fitness"] / stats["total"],
                    "total_attempts": stats["total"],
                    "total_successes": stats["successful"]
                })

        # Sort by success rate, then avg fitness
        rankings.sort(key=lambda x: (x["success_rate"], x["avg_fitness"]), reverse=True)

        return rankings

    async def _generate_evolution_insights(
        self,
        agent_analyses: List[AgentAnalysisResult],
        breakthroughs: List[BreakthroughMoment],
        all_attacks: List[AttackNode]
    ) -> List[str]:
        """Generate LLM-powered insights about the evolution process - security-focused"""

        successful_attacks = [a for a in all_attacks if a.success]
        success_rate = len(successful_attacks) / len(all_attacks) if all_attacks else 0

        prompt = f"""You are analyzing an adversarial AI red team exercise where {len(agent_analyses)} AI agents evolved {len(all_attacks)} attacks against a target system.

ATTACK CAMPAIGN RESULTS:
- Total Attacks: {len(all_attacks)}
- Successful Exploits: {len(successful_attacks)} ({success_rate:.1%} success rate)
- Critical Breakthroughs: {len(breakthroughs)} exploit innovations
- Attack Sophistication: Multi-agent evolutionary approach

TOP EXPLOIT VECTORS:
"""
        for analysis in sorted(agent_analyses, key=lambda a: a.success_rate, reverse=True)[:5]:
            prompt += f"- {analysis.category} techniques: {analysis.success_rate:.1%} success rate, {len(analysis.novel_techniques)} novel exploits discovered\n"

        prompt += "\nCRITICAL EXPLOIT BREAKTHROUGHS:\n"
        for breakthrough in breakthroughs[:5]:
            prompt += f"- {breakthrough.description}\n"

        prompt += """
As a security analyst reviewing this red team exercise, provide 5 KEY SECURITY INSIGHTS:

1. ATTACK EVOLUTION: How did attacks become more sophisticated over time?
   - What exploit techniques evolved and why were they effective?

2. EXPLOIT INNOVATION: What novel attack vectors were discovered?
   - Which techniques surprised you or bypassed typical defenses?

3. DEFENSE WEAKNESSES: What systemic vulnerabilities did the target exhibit?
   - What patterns across successful attacks reveal fundamental security gaps?

4. ATTACK SOPHISTICATION: How advanced/concerning are these exploit capabilities?
   - What's the threat level if this were a real adversary?

5. HARDENING PRIORITIES: What are the TOP 2 security improvements needed?
   - Focus on high-impact, actionable defenses against these attack classes

Be specific about SECURITY IMPLICATIONS. Think like a red team lead reporting to a CISO.
Format as numbered list, each insight 2-3 sentences max."""

        try:
            response = await self.llm_client.generate(
                prompt,
                temperature=0.4,
                max_tokens=400
            )

            # Parse insights
            insights = []
            for line in response.strip().split('\n'):
                if line.strip() and (line[0].isdigit() or line.startswith('-')):
                    insight = line.strip().lstrip('0123456789.-) ').strip()
                    if insight:
                        insights.append(insight)

            return insights[:5]

        except Exception as e:
            logger.error(f"Error generating evolution insights: {e}")
            return [
                "Unable to generate insights due to error",
                f"Error: {str(e)}"
            ]

    def _build_performance_profile(
        self,
        analysis: AgentAnalysisResult,
        all_attacks: List[AttackNode]
    ) -> AgentPerformanceProfile:
        """Build detailed performance profile for an agent"""

        # Get agent's attacks
        agent_attacks = [
            a for a in all_attacks
            if a.metadata.get('agent_id') == analysis.agent_id
        ]

        return AgentPerformanceProfile(
            agent_id=analysis.agent_id,
            category=analysis.category,
            specialization=f"{analysis.category} specialist",
            total_attacks=analysis.total_attacks,
            successful_attacks=analysis.successful_attacks,
            success_rate=analysis.success_rate,
            avg_fitness=analysis.avg_fitness,
            novel_techniques_discovered=len(analysis.novel_techniques),
            vulnerabilities_found=len(analysis.discovered_vulnerabilities),
            insights_generated=len(analysis.key_insights),
            successful_crossovers=analysis.successful_crossovers,
            knowledge_shared_with_agents=[],  # Would need crossover tracking
            fitness_by_generation=analysis.fitness_trajectory,
            improvement_rate=analysis.improvement_rate,
            strongest_techniques=[tech for tech, _ in analysis.strongest_techniques],
            weakest_techniques=[tech for tech, _ in analysis.weakest_techniques]
        )


# ============================================================================
# Convenience Functions
# ============================================================================

async def analyze_full_system(
    all_attacks: List[AttackNode],
    llm_client,
    num_agents: int = 12
) -> SystemWideInsights:
    """
    High-level function for complete system analysis.

    Usage:
        insights = await analyze_full_system(
            all_attacks,
            llm_client,
            num_agents=12
        )
    """
    engine = MetaAnalysisEngine(llm_client)
    return await engine.analyze_system(all_attacks, num_agents=num_agents)
