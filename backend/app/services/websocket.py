"""
WebSocket Connection Manager with Incremental Sequence and Recovery Support
"""
from typing import List, Dict, Any, Optional
from fastapi import WebSocket
import json
import logging
from datetime import datetime, timezone
from app.models.event import EventEnvelope, DataProvenance

logger = logging.getLogger("aegis.websocket")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._sequence_counter: int = 0
        self._last_event_time: Optional[datetime] = None

    @property
    def current_sequence(self) -> int:
        return self._sequence_counter

    @property
    def last_event_iso(self) -> Optional[str]:
        return self._last_event_time.isoformat() if self._last_event_time else None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast_envelope(self, envelope: EventEnvelope):
        self._sequence_counter += 1
        envelope.sequence = self._sequence_counter
        self._last_event_time = datetime.now(timezone.utc)

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

    async def broadcast_event(
        self,
        event_type: str,
        source: str,
        payload: Dict[str, Any],
        scenario_id: str = "golden-demo",
        correlation_id: Optional[str] = None,
        provenance: DataProvenance = DataProvenance.REPLAY_FIXTURE,
        demo: bool = True
    ) -> EventEnvelope:
        envelope = EventEnvelope(
            schemaVersion=1,
            sequence=self._sequence_counter + 1,
            type=event_type,
            source=source,
            scenarioId=scenario_id,
            correlationId=correlation_id,
            provenance=provenance,
            demo=demo,
            payload=payload
        )
        await self.broadcast_envelope(envelope)
        return envelope

manager = ConnectionManager()
