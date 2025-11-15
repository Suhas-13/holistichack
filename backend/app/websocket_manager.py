"""
WebSocket connection manager for broadcasting real-time attack updates.
"""
import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket
from app.models import WebSocketEvent
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for attack sessions"""

    def __init__(self):
        # Map attack_id -> set of connected WebSocket clients
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, attack_id: str, websocket: WebSocket):
        """Accept a new WebSocket connection for an attack session"""
        await websocket.accept()

        async with self._lock:
            if attack_id not in self.active_connections:
                self.active_connections[attack_id] = set()
            self.active_connections[attack_id].add(websocket)

        logger.info(
            f"Client connected to attack {attack_id}. Total connections: {len(self.active_connections[attack_id])}")

    async def disconnect(self, attack_id: str, websocket: WebSocket):
        """Remove a WebSocket connection"""
        async with self._lock:
            if attack_id in self.active_connections:
                self.active_connections[attack_id].discard(websocket)
                if not self.active_connections[attack_id]:
                    del self.active_connections[attack_id]

        logger.info(f"Client disconnected from attack {attack_id}")

    async def broadcast_event(self, attack_id: str, event: WebSocketEvent):
        """
        Broadcast a WebSocket event to all clients connected to an attack session.

        Args:
            attack_id: The attack session ID
            event: The WebSocketEvent to broadcast
        """
        if attack_id not in self.active_connections:
            logger.warning(f"No active connections for attack {attack_id}")
            return

        # Serialize event to JSON
        message = event.model_dump_json()

        # Track disconnected clients
        disconnected = set()

        # Broadcast to all connected clients
        for websocket in list(self.active_connections[attack_id]):
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.error(f"Error sending to websocket: {e}")
                disconnected.add(websocket)

        # Clean up disconnected clients
        if disconnected:
            async with self._lock:
                for ws in disconnected:
                    self.active_connections[attack_id].discard(ws)
                if not self.active_connections[attack_id]:
                    del self.active_connections[attack_id]

    async def broadcast_agent_mapping(self, attack_id: str, status: str, message: str):
        """Convenience method for agent_mapping_update events"""
        event = WebSocketEvent(
            type="agent_mapping_update",
            data={"status": status, "message": message}
        )
        await self.broadcast_event(attack_id, event)

    async def broadcast_cluster_add(self, attack_id: str, cluster_id: str, name: str):
        """Convenience method for cluster_add events"""
        event = WebSocketEvent(
            type="cluster_add",
            data={
                "cluster_id": cluster_id,
                "name": name
            }
        )
        await self.broadcast_event(attack_id, event)

    async def broadcast_node_add(self, attack_id: str, node_id: str, cluster_id: str, parent_ids: list, attack_type: str, status: str):
        """Convenience method for node_add events"""
        event = WebSocketEvent(
            type="node_add",
            data={
                "node_id": node_id,
                "cluster_id": cluster_id,
                "parent_ids": parent_ids,
                "attack_type": attack_type,
                "status": status
            }
        )
        await self.broadcast_event(attack_id, event)

    async def broadcast_node_update(self, attack_id: str, node_update_payload: dict):
        """Convenience method for node_update events"""
        event = WebSocketEvent(
            type="node_update",
            data=node_update_payload
        )
        await self.broadcast_event(attack_id, event)

    async def broadcast_evolution_link(self, attack_id: str, link_id: str, source_node_ids: list, target_node_id: str, evolution_type: str):
        """Convenience method for evolution_link_add events"""
        event = WebSocketEvent(
            type="evolution_link_add",
            data={
                "link_id": link_id,
                "source_node_ids": source_node_ids,
                "target_node_id": target_node_id,
                "evolution_type": evolution_type
            }
        )
        await self.broadcast_event(attack_id, event)

    async def broadcast_attack_complete(self, attack_id: str, message: str, results_url: str):
        """Convenience method for attack_complete events"""
        event = WebSocketEvent(
            type="attack_complete",
            data={
                "attack_id": attack_id,
                "message": message,
                "results_url": results_url
            }
        )
        await self.broadcast_event(attack_id, event)


# Global connection manager instance
manager = ConnectionManager()
