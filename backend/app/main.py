"""
Main FastAPI application with REST API and WebSocket endpoints.
"""
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
    allow_origins=settings.cors_origins_list,
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

    # Construct WebSocket URL
    websocket_url = f"ws://{settings.HOST}:{settings.PORT}/ws/v1/{attack_id}"
    if settings.ENVIRONMENT == "production":
        # In production, use wss:// and your actual domain
        websocket_url = f"wss://your-domain.com/ws/v1/{attack_id}"

    # Start attack session asynchronously (fire and forget)
    asyncio.create_task(
        orchestrator.run_attack_session(
            attack_id=attack_id,
            target_endpoint=request.target_endpoint,
            attack_goals=request.attack_goals,
            seed_attack_count=request.seed_attack_count
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
        logger.info(f"WebSocket disconnected for attack {attack_id}")

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
