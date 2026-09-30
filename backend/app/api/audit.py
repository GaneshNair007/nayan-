"""
Global Audit Log API Endpoint
"""
from fastapi import APIRouter
from typing import List
from app.models.event import AuditEvent
from app.database import db

router = APIRouter()

@router.get("/audit", response_model=List[AuditEvent])
def get_global_audit_trail():
    return db.audit_events
