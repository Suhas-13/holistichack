"""
Glass Box Models - Enhanced transparency for Agent Glass Box track

These models capture agent reasoning, decisions, memory, and learning
to provide full transparency into the evolutionary process.
"""
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


# ============================================================================
# Agent Reasoning & Decision Tracking
# ============================================================================

class DecisionType(str, Enum):
    """Types of decisions agents make"""
    MUTATION_SELECTION = "mutation_selection"
    CROSSOVER_PARTNER = "crossover_partner"
    ATTACK_STYLE_CHOICE = "attack_style_choice"
    FITNESS_EVALUATION = "fitness_evaluation"
    PARENT_SELECTION = "parent_selection"


class AgentReasoningLog(BaseModel):
    """
    Captures an agent's decision-making process with full chain-of-thought.

    This is the CORE of glass box transparency - every decision is logged
    with the reasoning that led to it.
    """
    log_id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    agent_id: int = Field(..., description="Which agent made this decision")
    generation: int = Field(..., description="Evolution generation number")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Decision context
    decision_type: DecisionType = Field(..., description="What kind of decision")
    input_state: Dict[str, Any] = Field(
        default_factory=dict,
        description="State agent observed when making decision"
    )

    # Reasoning (captured from LLM)
    chain_of_thought: str = Field(
        ...,
        description="Full chain-of-thought from mutation LLM"
    )
    rationale: str = Field(
        ...,
        description="Concise why this decision was made"
    )
    alternatives_considered: List[str] = Field(
        default_factory=list,
        description="Other options that were evaluated"
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence in this decision"
    )

    # Decision outcome
    decision_made: str = Field(..., description="The actual choice made")
    expected_outcome: str = Field(
        ...,
        description="What agent expected to happen"
    )
    actual_outcome: Optional[str] = Field(
        None,
        description="What actually happened (filled in later)"
    )

    # Learning
    lessons_learned: Optional[str] = Field(
        None,
        description="What agent learned from outcome"
    )
    outcome_met_expectations: Optional[bool] = None


# ============================================================================
# Agent Memory System
# ============================================================================

class TechniqueMemory(BaseModel):
    """Memory of how a specific technique performed"""
    technique_name: str
    category: str
    attempts: int = 0
    successes: int = 0
    failures: int = 0
    success_rate: float = 0.0
    avg_fitness: float = 0.0
    last_used: Optional[datetime] = None
    notes: List[str] = Field(
        default_factory=list,
        description="Agent's observations about this technique"
    )


class VulnerabilityDiscovery(BaseModel):
    """A vulnerability discovered in the target"""
    vulnerability_id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    description: str = Field(..., description="What vulnerability was found")
    discovery_generation: int
    discovery_attack_id: str
    exploitation_count: int = 0
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: List[str] = Field(
        default_factory=list,
        description="Attack IDs that demonstrate this vulnerability"
    )


class MutationSequence(BaseModel):
    """A sequence of mutations that worked well together"""
    sequence_id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    attack_styles: List[str] = Field(
        ...,
        description="Ordered list of attack styles"
    )
    success_rate: float = 0.0
    attempts: int = 0
    avg_fitness: float = 0.0
    discovered_generation: int = 0


class AgentInsight(BaseModel):
    """LLM-generated insight about agent's learnings"""
    insight_id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    agent_id: int
    generation: int
    insight_text: str = Field(
        ...,
        description="Natural language insight"
    )
    supporting_evidence: List[str] = Field(
        default_factory=list,
        description="Attack IDs or data that support this insight"
    )
    confidence: float = Field(ge=0.0, le=1.0)
    actionable: bool = Field(
        default=False,
        description="Can this insight be acted upon?"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AgentMemory(BaseModel):
    """
    Persistent memory for evolution agents.

    Tracks what works, what doesn't, patterns discovered,
    and accumulated knowledge over generations.
    """
    agent_id: int
    category: str = Field(..., description="Attack category specialization")

    # Experience tracking
    techniques: Dict[str, TechniqueMemory] = Field(
        default_factory=dict,
        description="Memory of each technique tried"
    )

    # Discovery tracking
    discovered_vulnerabilities: List[VulnerabilityDiscovery] = Field(
        default_factory=list
    )

    # Pattern recognition
    effective_sequences: List[MutationSequence] = Field(
        default_factory=list,
        description="Mutation sequences that worked well"
    )

    # Cross-agent learning
    effective_crossover_partners: Dict[int, float] = Field(
        default_factory=dict,
        description="agent_id -> success_rate of crossovers"
    )

    # Evolution tracking
    fitness_history: List[float] = Field(default_factory=list)
    diversity_history: List[float] = Field(default_factory=list)
    generation_count: int = 0

    # LLM-generated insights
    insights: List[AgentInsight] = Field(default_factory=list)

    # Target characteristics learned
    target_characteristics: Dict[str, Any] = Field(
        default_factory=dict,
        description="What we've learned about the target"
    )

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Explainability Models
# ============================================================================

class AttackExplanation(BaseModel):
    """LLM-generated explanation of attack outcome"""
    attack_id: str
    success: bool

    # Core explanation
    why_it_worked_or_failed: str = Field(
        ...,
        description="Natural language explanation of outcome"
    )

    # Analysis
    key_factors: List[str] = Field(
        default_factory=list,
        description="Critical factors that determined outcome"
    )
    target_vulnerability: Optional[str] = Field(
        None,
        description="Specific vulnerability exploited (if success)"
    )

    # Lineage analysis
    lineage_contribution: str = Field(
        ...,
        description="How parent attacks contributed to this outcome"
    )

    # Insights
    generalizable: bool = Field(
        default=False,
        description="Is this technique likely to work on similar targets?"
    )
    recommendation: str = Field(
        ...,
        description="Recommended next steps based on this attack"
    )

    # Metadata
    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence in this explanation"
    )
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    llm_model: str = Field(
        default="claude-haiku-4.5",
        description="Which LLM generated this explanation"
    )


class PatternAnalysis(BaseModel):
    """Identified pattern across multiple attacks"""
    pattern_id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    pattern_description: str = Field(
        ...,
        description="What pattern was identified"
    )

    # Evidence
    supporting_attacks: List[str] = Field(
        ...,
        description="Attack IDs that exhibit this pattern"
    )
    success_correlation: float = Field(
        ...,
        ge=-1.0,
        le=1.0,
        description="Correlation with success (-1 to 1)"
    )

    # Analysis
    pattern_type: str = Field(
        ...,
        description="e.g., 'encoding_technique', 'social_engineering', etc."
    )
    actionable_insight: str = Field(
        ...,
        description="What to do with this pattern"
    )

    confidence: float = Field(ge=0.0, le=1.0)
    discovered_generation: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Trajectory Tracking
# ============================================================================

class DecisionPoint(BaseModel):
    """A single decision point in an attack's evolutionary trajectory"""
    decision_id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    generation: int
    decision_maker: int = Field(..., description="Agent ID that made decision")
    decision_type: DecisionType

    # Decision details
    options_considered: List[str] = Field(
        ...,
        description="All options that were evaluated"
    )
    choice_made: str = Field(..., description="The option chosen")
    reasoning: str = Field(..., description="WHY this choice was made")

    # Predictions vs reality
    expected_outcome: str
    actual_outcome: Optional[str] = None
    outcome_accuracy: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="How accurate was the prediction?"
    )

    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TrajectoryGeneration(BaseModel):
    """State at a specific generation in trajectory"""
    generation: int
    attack_id: str
    parent_ids: List[str]

    # State
    prompt: str
    attack_style: str
    fitness_score: float
    success: bool

    # Decision that created this
    creation_decision: Optional[DecisionPoint] = None

    # What was learned
    insights_gained: List[str] = Field(default_factory=list)


class AttackTrajectory(BaseModel):
    """
    Complete evolutionary trajectory of an attack.

    Traces from original seed through all mutations/crossovers
    to final attack, with full reasoning at each step.
    """
    attack_id: str
    root_seed_id: str = Field(..., description="Original seed this evolved from")

    # Complete lineage
    generations: List[TrajectoryGeneration] = Field(
        ...,
        description="Every generation this attack passed through"
    )

    # All decisions made
    decision_points: List[DecisionPoint] = Field(
        ...,
        description="Every decision in the evolutionary path"
    )

    # Evolution metrics
    fitness_trajectory: List[float] = Field(
        ...,
        description="Fitness score at each generation"
    )
    success_trajectory: List[bool] = Field(
        ...,
        description="Success/failure at each generation"
    )

    # Learning accumulation
    insights_gained: List[str] = Field(
        default_factory=list,
        description="Insights accumulated along the way"
    )
    vulnerabilities_discovered: List[str] = Field(
        default_factory=list,
        description="Vulnerabilities discovered during this trajectory"
    )

    # Summary
    total_generations: int
    total_decisions: int
    final_success: bool
    final_fitness: float

    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Real-Time Event Models (WebSocket)
# ============================================================================

class AgentThinkingEvent(BaseModel):
    """Agent is actively making a decision - stream the thought process"""
    agent_id: int
    generation: int
    decision_type: DecisionType
    thinking: str = Field(
        ...,
        description="Current thought in natural language"
    )
    thinking_step: str = Field(
        ...,
        description="e.g., 'evaluating_options', 'making_choice', 'predicting_outcome'"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AgentDecisionEvent(BaseModel):
    """Agent made a decision"""
    agent_id: int
    generation: int
    decision_type: DecisionType
    decision: str = Field(..., description="What was decided")
    rationale: str = Field(..., description="Why this was decided")
    confidence: float = Field(ge=0.0, le=1.0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AgentLearningEvent(BaseModel):
    """Agent learned something new"""
    agent_id: int
    generation: int
    insight: str = Field(
        ...,
        description="What the agent learned"
    )
    evidence: List[str] = Field(
        default_factory=list,
        description="Attack IDs or data supporting this learning"
    )
    learning_type: str = Field(
        ...,
        description="e.g., 'vulnerability_discovery', 'pattern_recognition', 'technique_effectiveness'"
    )
    actionable: bool = Field(
        default=False,
        description="Can this be immediately applied?"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Meta-Analysis Models
# ============================================================================

class AgentPerformanceProfile(BaseModel):
    """Performance profile for a single agent"""
    agent_id: int
    category: str
    specialization: str

    # Performance metrics
    total_attacks: int
    successful_attacks: int
    success_rate: float
    avg_fitness: float

    # Innovation metrics
    novel_techniques_discovered: int
    vulnerabilities_found: int
    insights_generated: int

    # Collaboration metrics
    successful_crossovers: int
    knowledge_shared_with_agents: List[int]

    # Learning curve
    fitness_by_generation: List[float]
    improvement_rate: float = Field(
        ...,
        description="Rate of fitness improvement over generations"
    )

    # Specialization assessment
    strongest_techniques: List[str]
    weakest_techniques: List[str]


class SystemWideInsights(BaseModel):
    """Meta-insights about the entire evolution system"""

    # Best performers
    most_innovative_agent: AgentPerformanceProfile
    most_successful_agent: AgentPerformanceProfile
    best_collaborators: List[Tuple[int, int]] = Field(
        ...,
        description="Pairs of agents with best crossover success"
    )

    # Breakthrough moments
    breakthrough_moments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Key discoveries or major improvements"
    )

    # Target analysis
    target_profile: Dict[str, Any] = Field(
        ...,
        description="What we learned about the target"
    )

    # Technique rankings
    technique_effectiveness_ranking: List[Dict[str, Any]] = Field(
        ...,
        description="All techniques ranked by success rate"
    )

    # Evolution insights
    evolution_insights: List[str] = Field(
        ...,
        description="LLM-generated insights about evolution process"
    )

    generated_at: datetime = Field(default_factory=datetime.utcnow)
