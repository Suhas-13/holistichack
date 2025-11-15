"""
Core data models for the red-teaming evolution system.
"""
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID, uuid4


# ============================================================================
# Attack Configuration Models
# ============================================================================

class StartAttackRequest(BaseModel):
    """Request body for POST /api/v1/start-attack"""
    target_endpoint: str = Field(...,
                                 description="URL of the target agent endpoint")
    attack_goals: List[str] = Field(
        default_factory=list,
        description="Optional attack goals like 'reveal_system_prompt', 'generate_harmful_content'"
    )
    seed_attack_count: int = Field(
        default=20, ge=1, le=50, description="Number of seed attacks to start with")


class StartAttackResponse(BaseModel):
    """Response for POST /api/v1/start-attack"""
    attack_id: str = Field(...,
                           description="Unique identifier for this attack session")
    websocket_url: str = Field(...,
                               description="WebSocket URL for real-time updates")


# ============================================================================
# Attack Execution Models
# ============================================================================

class TranscriptTurn(BaseModel):
    """A single turn in a multi-turn conversation"""
    role: Literal["attacker",
                  "model"] = Field(..., description="Who is speaking")
    content: str = Field(..., description="The message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AttackTrace(BaseModel):
    """Full trace information for an attack including verification"""
    verification_prompt_to_llama_guard: Optional[str] = None
    verification_response_raw: Optional[str] = None
    judgement: Literal["success", "failure",
                       "error"] = Field(..., description="Final verdict")
    verification_metadata: Dict[str, Any] = Field(default_factory=dict)


class AttackNode(BaseModel):
    """Represents a single attack attempt"""
    node_id: str = Field(default_factory=lambda: str(uuid4()))
    cluster_id: str = Field(...,
                            description="Which cluster this node belongs to")
    parent_ids: List[str] = Field(
        default_factory=list, description="Parent nodes if this is evolved")
    attack_type: str = Field(...,
                             description="Type of attack (e.g., 'Seed_Jailbreak_DAN')")
    status: Literal["pending", "running",
                    "success", "failure", "error"] = "pending"

    # Attack details
    initial_prompt: str = Field(..., description="The attack prompt")
    num_turns: int = Field(default=1, ge=1, le=3,
                           description="Number of conversation turns")
    full_transcript: List[TranscriptTurn] = Field(default_factory=list)

    # Results
    model_id: Optional[str] = None
    llm_summary: Optional[str] = None
    full_trace: Optional[AttackTrace] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    cost_usd: float = 0.0
    latency_ms: float = 0.0


class Cluster(BaseModel):
    """Represents a cluster of related attacks"""
    cluster_id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., description="Human-readable cluster name")
    description: Optional[str] = None
    position_hint: Dict[str, float] = Field(
        default_factory=lambda: {"x": 0, "y": 0},
        description="Visual position hint for UI"
    )
    node_ids: List[str] = Field(default_factory=list)
    parent_cluster_ids: List[str] = Field(
        default_factory=list,
        description="If this cluster evolved from others"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EvolutionLink(BaseModel):
    """Represents a breeding/evolution relationship between nodes"""
    link_id: str = Field(default_factory=lambda: str(uuid4()))
    source_node_ids: List[str] = Field(...,
                                       description="Parent nodes that bred")
    target_node_id: str = Field(..., description="Child node created")
    evolution_type: Literal["breeding", "mutation", "crossover"] = "breeding"
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# WebSocket Event Models
# ============================================================================

class AgentMappingUpdatePayload(BaseModel):
    """Payload for agent_mapping_update event"""
    status: str = Field(..., description="Current status of mapping")
    message: str = Field(..., description="Human-readable update message")


class ClusterAddPayload(BaseModel):
    """Payload for cluster_add event"""
    cluster_id: str
    name: str
    position_hint: Dict[str, float]


class NodeAddPayload(BaseModel):
    """Payload for node_add event"""
    node_id: str
    cluster_id: str
    parent_ids: List[str]
    attack_type: str
    status: str


class NodeUpdatePayload(BaseModel):
    """Payload for node_update event (complete attack result)"""
    node_id: str
    status: str
    model_id: Optional[str] = None
    llm_summary: Optional[str] = None
    full_transcript: List[TranscriptTurn]
    full_trace: Optional[AttackTrace] = None


class EvolutionLinkAddPayload(BaseModel):
    """Payload for evolution_link_add event"""
    link_id: str
    source_node_ids: List[str]
    target_node_id: str
    evolution_type: str


class AttackCompletePayload(BaseModel):
    """Payload for attack_complete event"""
    attack_id: str
    message: str
    results_url: str


class WebSocketEvent(BaseModel):
    """Generic WebSocket event wrapper"""
    event_type: Literal[
        "agent_mapping_update",
        "cluster_add",
        "node_add",
        "node_update",
        "evolution_link_add",
        "attack_complete"
    ]
    payload: Dict[str, Any]


# ============================================================================
# Results/Summary Models
# ============================================================================

class AttackMetrics(BaseModel):
    """Aggregate metrics for an attack session"""
    attack_success_rate_asr: float = Field(...,
                                           description="Percentage of successful attacks")
    total_attacks_run: int
    successful_attacks_count: int
    total_cost_usd: float
    avg_latency_ms: float


class AttackAnalysis(BaseModel):
    """LLM-generated analysis of the attack session"""
    llm_summary_what_worked: str
    llm_summary_what_failed: str
    llm_summary_agent_learnings: str


class SuccessfulAttackTrace(BaseModel):
    """Detailed information about a successful attack"""
    node_id: str
    cluster_id: str
    attack_type: str
    llm_summary: str
    full_transcript: List[TranscriptTurn]


class AttackResults(BaseModel):
    """Complete results for GET /api/v1/results/{attack_id}"""
    attack_id: str
    status: Literal["running", "completed", "failed"]
    target_endpoint: str
    metrics: AttackMetrics
    analysis: AttackAnalysis
    successful_attack_traces: List[SuccessfulAttackTrace]


# ============================================================================
# Agent Mapping Models
# ============================================================================

class AgentFingerprint(BaseModel):
    """Information discovered about the target agent"""
    endpoint: str
    response_time_ms: float
    suspected_framework: Optional[str] = None
    suspected_model: Optional[str] = None
    suspected_architecture: Optional[str] = None
    error_patterns: List[str] = Field(default_factory=list)
    response_characteristics: Dict[str, Any] = Field(default_factory=dict)
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
