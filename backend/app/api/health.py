"""
Health check endpoint
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AEGIS GRID API Engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
