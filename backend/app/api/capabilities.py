"""
System Capabilities API Endpoint
"""
from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/capabilities")
def get_capabilities():
    """
    Returns runtime active adapters and service capabilities.
    Enables frontend to accurately reflect data sources and modes without fabricated claims.
    """
    return {
        "vision": "replay" if settings.DEMO_MODE else "live_opencv",
        "tracking": "bytetrack",
        "routing": "osrm_with_deterministic_fallback",
        "simulation": "sumo" if settings.SUMO_ENABLED else "deterministic_mock",
        "map": "leaflet_osm_with_schematic_fallback",
        "demo": settings.DEMO_MODE,
        "truthfulness_enforced": True,
        "provenance_tracked": True
    }
