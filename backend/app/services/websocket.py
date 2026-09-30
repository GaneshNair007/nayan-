"""
WebSocket Connection Manager and Event Broadcaster
"""
from typing import List, Dict, Any
from fastapi import WebSocket
import json
import logging
from app.models.event import EventEnvelope

logger = logging.getLogger("aegis.websocket")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining clients: {len(self.active_connections)}")

    async def broadcast_envelope(self, envelope: EventEnvelope):
        data_str = envelope.model_dump_json()
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(data_str)
            except Exception as e:
                logger.warning(f"Error sending to WebSocket client: {e}")
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

    async def broadcast_event(self, event_type: str, source: str, payload: Dict[str, Any], demo: bool = True):
        envelope = EventEnvelope(
            type=event_type,
            source=source,
            payload=payload,
            demo=demo
        )
        await self.broadcast_envelope(envelope)

manager = ConnectionManager()
