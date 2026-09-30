"""
API Router Assembly
"""
from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.cameras import router as cameras_router
from app.api.incidents import router as incidents_router
from app.api.junctions import router as junctions_router
from app.api.resources import router as resources_router
from app.api.corridors import router as corridors_router
from app.api.demo import router as demo_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(cameras_router, prefix="/cameras", tags=["Cameras"])
api_router.include_router(incidents_router, prefix="/incidents", tags=["Incidents"])
api_router.include_router(junctions_router, prefix="/junctions", tags=["Junctions"])
api_router.include_router(resources_router, prefix="/resources", tags=["Resources"])
api_router.include_router(corridors_router, prefix="/corridors", tags=["Corridors"])
api_router.include_router(demo_router, prefix="/demo", tags=["Demo Simulation"])
