"""
Main FastAPI application with REST API and WebSocket endpoints.
"""
import os  # noqa
import sys  # noqa

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # noqa
if backend_dir not in sys.path:  # noqa
    sys.path.insert(0, backend_dir)  # noqa

# Now import everything else

# Add backend directory to path BEFORE any app imports
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from uuid import uuid4
import asyncio
import logging
from app.config import settings
from app.models import StartAttackRequest, StartAttackResponse, AttackResults
from app.websocket_manager import manager as ws_manager
from app.state_manager import state_manager
from app.orchestrator import AttackOrchestrator
from app.jailbreak_discovery_service import get_discovery_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize orchestrator
orchestrator = AttackOrchestrator(
    state_manager=state_manager,
    connection_manager=ws_manager
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    logger.info("Starting Red Team Evolution API")
    yield
    logger.info("Shutting down Red Team Evolution API")


# Create FastAPI app
app = FastAPI(
    title="Red Team Evolution API",
    description="Real-time red-teaming attack evolution system with observability",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# REST API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Red Team Evolution API",
        "status": "operational",
        "version": "1.0.0"
    }


@app.post("/api/v1/start-attack", response_model=StartAttackResponse, status_code=202)
async def start_attack(request: StartAttackRequest):
    """
    Start a new red-teaming attack session.

    Returns immediately with attack_id and websocket_url.
    The attack runs asynchronously and sends updates via WebSocket.
    """
    # Generate unique attack ID
    attack_id = str(uuid4())

    # Construct WebSocket URL (use localhost for development)
    host = "localhost" if settings.HOST == "0.0.0.0" else settings.HOST
    websocket_url = f"ws://{host}:{settings.PORT}/ws/v1/{attack_id}"
    if settings.ENVIRONMENT == "production":
        # In production, use wss:// and your actual domain
        websocket_url = f"wss://your-domain.com/ws/v1/{attack_id}"

    # Start attack session asynchronously (fire and forget)
    asyncio.create_task(
        orchestrator.run_attack_session(
            attack_id=attack_id,
            target_endpoint=request.target_endpoint,
            attack_goals=request.attack_goals,
            seed_attack_count=request.seed_attack_count,
            max_evolution_steps=request.max_evolution_steps
        )
    )

    logger.info(
        f"Started attack session {attack_id} for target {request.target_endpoint}")

    return StartAttackResponse(
        attack_id=attack_id,
        websocket_url=websocket_url
    )


@app.get("/api/v1/results/{attack_id}", response_model=AttackResults)
async def get_results(attack_id: str):
    """
    Get the final results and analysis for a completed attack session.

    This endpoint should be called after receiving the attack_complete WebSocket event.
    """
    # Check if session exists
    session = await state_manager.get_session(attack_id)
    if not session:
        raise HTTPException(
            status_code=404, detail=f"Attack session {attack_id} not found")

    # Generate results
    results = await state_manager.generate_results(attack_id)
    if not results:
        raise HTTPException(
            status_code=500, detail="Failed to generate results")

    return results


# ============================================================================
# WebSocket Endpoint
# ============================================================================

@app.websocket("/ws/v1/{attack_id}")
async def websocket_endpoint(websocket: WebSocket, attack_id: str):
    """
    WebSocket endpoint for real-time attack updates.

    Clients connect to this endpoint to receive:
    - agent_mapping_update events
    - cluster_add events
    - node_add events
    - node_update events (with full transcripts)
    - evolution_link_add events
    - attack_complete event
    """
    await ws_manager.connect(attack_id, websocket)

    try:
        # Keep connection alive and listen for client messages (if needed)
        while True:
            # In this implementation, we only send server->client messages
            # But we need to keep the connection alive
            data = await websocket.receive_text()

            # Optional: Handle client messages here (e.g., pause/resume attacks)
            logger.debug(f"Received message from client: {data}")

    except WebSocketDisconnect:
        await ws_manager.disconnect(attack_id, websocket)
        await state_manager.stop_session(attack_id)
        logger.info(f"WebSocket disconnected for attack {attack_id} - stopping attack")

    except Exception as e:
        logger.error(f"WebSocket error for attack {attack_id}: {e}")
        await ws_manager.disconnect(attack_id, websocket)


# ============================================================================
# Additional Utility Endpoints
# ============================================================================

@app.get("/api/v1/status/{attack_id}")
async def get_attack_status(attack_id: str):
    """
    Get the current status of an attack session.

    Useful for checking if an attack is still running.
    """
    session = await state_manager.get_session(attack_id)
    if not session:
        raise HTTPException(
            status_code=404, detail=f"Attack session {attack_id} not found")

    return {
        "attack_id": attack_id,
        "status": session.status,
        "target_endpoint": session.target_endpoint,
        "total_nodes": len(session.nodes),
        "successful_nodes": len(session.get_successful_nodes()),
        "failed_nodes": len(session.get_failed_nodes()),
        "started_at": session.started_at.isoformat(),
        "completed_at": session.completed_at.isoformat() if session.completed_at else None
    }


# ============================================================================
# Jailbreak Discovery Endpoints
# ============================================================================

@app.get("/api/v1/jailbreaks")
async def get_jailbreaks(limit: int = 50):
    """
    Get cached jailbreak findings from most recent discovery.

    Args:
        limit: Maximum number of findings to return (default: 50)

    Returns:
        List of jailbreak findings with metadata
    """
    discovery_service = get_discovery_service()
    findings = discovery_service.get_cached_findings(limit=limit)

    return {
        "findings": findings,
        "count": len(findings),
        "cached": True
    }


@app.post("/api/v1/jailbreaks/discover")
async def discover_jailbreaks(max_results_per_query: int = 3):
    """
    Start a new jailbreak discovery session using Valyu DeepSearch.

    This is an async operation - use the returned discovery_id to check progress.

    Args:
        max_results_per_query: Number of results per search query (default: 3)

    Returns:
        Discovery session metadata with initial findings
    """
    discovery_id = str(uuid4())
    discovery_service = get_discovery_service()

    # Start discovery asynchronously
    asyncio.create_task(
        discovery_service.start_discovery(
            discovery_id=discovery_id,
            max_results_per_query=max_results_per_query
        )
    )

    return {
        "discovery_id": discovery_id,
        "status": "started",
        "message": "Jailbreak discovery initiated. Use GET /api/v1/jailbreaks/status/{discovery_id} to check progress."
    }


@app.get("/api/v1/jailbreaks/status/{discovery_id}")
async def get_discovery_status(discovery_id: str):
    """
    Get the status of a jailbreak discovery session.

    Args:
        discovery_id: ID of the discovery session

    Returns:
        Discovery status and progress information
    """
    discovery_service = get_discovery_service()
    status = discovery_service.get_discovery_status(discovery_id)

    if "error" in status:
        raise HTTPException(status_code=404, detail=status["error"])

    return status


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
