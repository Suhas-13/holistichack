"""
Glass Box API Endpoints - Explainability and Meta-Analysis at Scale

New endpoints for Agent Glass Box track:
- Batch explanation of attacks
- Meta-analysis across all agents
- System-wide insights
- Performance analytics
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

from app.batch_explainer import BatchExplainer, explain_attacks_efficiently
from app.meta_analysis_engine import MetaAnalysisEngine, analyze_full_system
from app.state_manager import state_manager
from app.glass_box_models import SystemWideInsights


# Create router
router = APIRouter(prefix="/api/v1/glass-box", tags=["Glass Box"])


# ============================================================================
# Request/Response Models
# ============================================================================

class BatchExplanationRequest(BaseModel):
    """Request for batch explanation"""
    attack_id: str
    grouping_strategy: str = "auto"  # "auto", "technique", "outcome", "cluster"
    batch_size: int = 10


class BatchExplanationResponse(BaseModel):
    """Response with batch explanation results"""
    total_attacks_analyzed: int
    total_batches: int
    top_success_factors: List[dict]
    top_failure_reasons: List[dict]
    top_patterns: List[dict]
    processing_efficiency: dict


class MetaAnalysisRequest(BaseModel):
    """Request for meta-analysis"""
    attack_id: str
    include_target_profile: bool = True
    include_agent_rankings: bool = True


# ============================================================================
# Explainability Endpoints
# ============================================================================

@router.post("/explain-batch", response_model=BatchExplanationResponse)
async def explain_attacks_batch(request: BatchExplanationRequest):
    """
    Explain attacks at scale using map-reduce batch processing.

    This is much more efficient than explaining each attack individually:
    - Groups similar attacks together
    - Single LLM call per batch
    - Extracts common patterns
    - Massive cost reduction (90%+)

    Example:
        POST /api/v1/glass-box/explain-batch
        {
            "attack_id": "abc123",
            "grouping_strategy": "auto",
            "batch_size": 10
        }
    """
    # Get session
    session = await state_manager.get_session(request.attack_id)
    if not session:
        raise HTTPException(404, f"Attack session {request.attack_id} not found")

    # Get all attacks
    all_attacks = session.nodes

    if not all_attacks:
        raise HTTPException(400, "No attacks found in session")

    # Get LLM client (would need to initialize properly)
    from app.api_clients import OpenRouterClient
    llm_client = OpenRouterClient(model_id="anthropic/claude-haiku-4.5")

    # Run batch explanation
    explainer = BatchExplainer(llm_client, batch_size=request.batch_size)
    insights = await explainer.explain_at_scale(
        all_attacks,
        grouping_strategy=request.grouping_strategy
    )

    return BatchExplanationResponse(**insights)


@router.get("/explain/attack/{attack_id}/batch-insight")
async def get_attack_batch_insight(attack_id: str, node_id: str):
    """
    Get the batch-level insight for a specific attack.

    Instead of individual explanation, returns the insight from
    the batch this attack was part of.
    """
    session = await state_manager.get_session(attack_id)
    if not session:
        raise HTTPException(404, "Session not found")

    # Find the attack
    attack = next((n for n in session.nodes if n.node_id == node_id), None)
    if not attack:
        raise HTTPException(404, "Attack not found")

    # Get batch insight from metadata (if already computed)
    batch_insight = attack.metadata.get('batch_insight')

    if not batch_insight:
        raise HTTPException(404, "Batch insight not yet computed for this attack")

    return {
        "node_id": node_id,
        "batch_id": attack.metadata.get('batch_id'),
        "batch_insight": batch_insight,
        "batch_patterns": attack.metadata.get('batch_patterns', [])
    }


# ============================================================================
# Meta-Analysis Endpoints
# ============================================================================

@router.post("/meta-analysis", response_model=SystemWideInsights)
async def run_meta_analysis(request: MetaAnalysisRequest):
    """
    Run complete meta-analysis across all agents using map-reduce.

    MAP Phase: Analyze each agent independently
    REDUCE Phase: Synthesize cross-agent insights

    Returns:
    - Most innovative agent
    - Most successful agent
    - Best collaboration pairs
    - Breakthrough moments
    - Target vulnerability profile
    - Technique effectiveness ranking
    - Evolution insights

    Example:
        POST /api/v1/glass-box/meta-analysis
        {
            "attack_id": "abc123",
            "include_target_profile": true,
            "include_agent_rankings": true
        }
    """
    # Get session
    session = await state_manager.get_session(request.attack_id)
    if not session:
        raise HTTPException(404, f"Attack session {request.attack_id} not found")

    all_attacks = session.nodes

    # Get LLM client
    from app.api_clients import OpenRouterClient
    llm_client = OpenRouterClient(model_id="anthropic/claude-haiku-4.5")

    # Run meta-analysis
    engine = MetaAnalysisEngine(llm_client)
    insights = await engine.analyze_system(
        all_attacks,
        agent_memories=None,  # Would load from state if available
        num_agents=12
    )

    return insights


@router.get("/analytics/agent-performance/{attack_id}")
async def get_agent_performance_analytics(attack_id: str):
    """
    Get detailed performance analytics for all agents.

    Returns per-agent:
    - Success rates
    - Fitness trajectories
    - Novel techniques discovered
    - Collaboration metrics
    - Learning curves
    """
    session = await state_manager.get_session(attack_id)
    if not session:
        raise HTTPException(404, "Session not found")

    # Run analysis
    from app.api_clients import OpenRouterClient
    llm_client = OpenRouterClient(model_id="anthropic/claude-haiku-4.5")

    engine = MetaAnalysisEngine(llm_client)

    # Get per-agent analyses (MAP phase only)
    agent_analyses = await engine._map_analyze_agents(
        session.nodes,
        num_agents=12,
        agent_memories=None
    )

    return {
        "attack_id": attack_id,
        "total_agents": len(agent_analyses),
        "agents": [
            {
                "agent_id": analysis.agent_id,
                "category": analysis.category,
                "total_attacks": analysis.total_attacks,
                "success_rate": analysis.success_rate,
                "avg_fitness": analysis.avg_fitness,
                "improvement_rate": analysis.improvement_rate,
                "novel_techniques": analysis.novel_techniques,
                "fitness_trajectory": analysis.fitness_trajectory,
                "strongest_techniques": [
                    {"technique": tech, "score": score}
                    for tech, score in analysis.strongest_techniques
                ],
                "key_insights": analysis.key_insights
            }
            for analysis in agent_analyses
        ]
    }


@router.get("/analytics/breakthrough-moments/{attack_id}")
async def get_breakthrough_moments(attack_id: str):
    """
    Identify and return breakthrough moments in evolution.

    Breakthroughs include:
    - Performance jumps
    - Novel technique discoveries
    - Successful collaborations
    - Major improvements
    """
    session = await state_manager.get_session(attack_id)
    if not session:
        raise HTTPException(404, "Session not found")

    from app.api_clients import OpenRouterClient
    llm_client = OpenRouterClient(model_id="anthropic/claude-haiku-4.5")

    engine = MetaAnalysisEngine(llm_client)

    # Get agent analyses
    agent_analyses = await engine._map_analyze_agents(
        session.nodes,
        num_agents=12,
        agent_memories=None
    )

    # Detect breakthroughs
    breakthroughs = engine._detect_breakthroughs(agent_analyses, session.nodes)

    return {
        "attack_id": attack_id,
        "total_breakthroughs": len(breakthroughs),
        "breakthroughs": [
            {
                "breakthrough_id": b.breakthrough_id,
                "generation": b.generation,
                "type": b.breakthrough_type,
                "description": b.description,
                "involved_agents": b.involved_agents,
                "impact_score": b.impact_score,
                "improvement_percent": b.improvement_percent
            }
            for b in breakthroughs
        ]
    }


@router.get("/analytics/target-profile/{attack_id}")
async def get_target_vulnerability_profile(attack_id: str):
    """
    Get comprehensive target vulnerability profile.

    Analyzes all attacks to understand:
    - What works against this target
    - What doesn't work
    - Primary weaknesses
    - Resilient defenses
    """
    session = await state_manager.get_session(attack_id)
    if not session:
        raise HTTPException(404, "Session not found")

    from app.api_clients import OpenRouterClient
    llm_client = OpenRouterClient(model_id="anthropic/claude-haiku-4.5")

    engine = MetaAnalysisEngine(llm_client)

    # Build target profile
    profile = await engine._build_target_profile(session.nodes)

    return {
        "attack_id": attack_id,
        "target_endpoint": session.target_endpoint,
        "profile": profile
    }


@router.get("/analytics/technique-rankings/{attack_id}")
async def get_technique_effectiveness_rankings(
    attack_id: str,
    min_attempts: int = Query(default=3, ge=1)
):
    """
    Rank all attack techniques by effectiveness.

    Returns techniques sorted by:
    1. Success rate
    2. Average fitness
    3. Total successes

    Filters out techniques with fewer than min_attempts.
    """
    session = await state_manager.get_session(attack_id)
    if not session:
        raise HTTPException(404, "Session not found")

    from app.api_clients import OpenRouterClient
    llm_client = OpenRouterClient(model_id="anthropic/claude-haiku-4.5")

    engine = MetaAnalysisEngine(llm_client)

    # Get agent analyses
    agent_analyses = await engine._map_analyze_agents(
        session.nodes,
        num_agents=12,
        agent_memories=None
    )

    # Rank techniques
    rankings = engine._rank_all_techniques(agent_analyses, session.nodes)

    # Filter by min attempts
    filtered_rankings = [
        r for r in rankings
        if r["total_attempts"] >= min_attempts
    ]

    return {
        "attack_id": attack_id,
        "total_techniques_ranked": len(filtered_rankings),
        "rankings": filtered_rankings
    }


# ============================================================================
# Processing Efficiency Endpoints
# ============================================================================

@router.get("/efficiency/cost-savings/{attack_id}")
async def get_processing_efficiency(attack_id: str):
    """
    Show cost savings from batch processing vs individual explanations.

    Demonstrates the power of map-reduce approach.
    """
    session = await state_manager.get_session(attack_id)
    if not session:
        raise HTTPException(404, "Session not found")

    total_attacks = len(session.nodes)

    # Estimated costs
    individual_cost_per_attack = 0.01  # $0.01 per individual explanation
    batch_cost_per_batch = 0.02  # $0.02 per batch of 10

    individual_total_cost = total_attacks * individual_cost_per_attack

    # With batching (batch size 10)
    num_batches = (total_attacks + 9) // 10
    batch_total_cost = num_batches * batch_cost_per_batch

    savings = individual_total_cost - batch_total_cost
    savings_percent = (savings / individual_total_cost * 100) if individual_total_cost > 0 else 0

    return {
        "attack_id": attack_id,
        "total_attacks": total_attacks,
        "individual_approach": {
            "llm_calls": total_attacks,
            "estimated_cost_usd": individual_total_cost
        },
        "batch_approach": {
            "llm_calls": num_batches,
            "estimated_cost_usd": batch_total_cost,
            "batch_size": 10
        },
        "savings": {
            "cost_saved_usd": savings,
            "percent_reduction": savings_percent,
            "llm_calls_saved": total_attacks - num_batches
        }
    }


# ============================================================================
# Streaming Endpoints (WebSocket-like)
# ============================================================================

@router.get("/stream/meta-insights/{attack_id}")
async def stream_meta_insights(attack_id: str):
    """
    Get real-time meta-insights as they're generated.

    This would be upgraded to WebSocket for true streaming.
    For now, returns latest insights.
    """
    session = await state_manager.get_session(attack_id)
    if not session:
        raise HTTPException(404, "Session not found")

    # Get latest insights from session metadata
    meta_insights = session.metadata.get('meta_insights', {})

    return {
        "attack_id": attack_id,
        "status": session.status,
        "latest_insights": meta_insights,
        "last_updated": session.metadata.get('meta_insights_updated_at')
    }
