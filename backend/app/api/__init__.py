"""
API Router Assembly
"""
from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.capabilities import router as capabilities_router
from app.api.audit import router as audit_router
from app.api.cameras import router as cameras_router
from app.api.incidents import router as incidents_router
from app.api.junctions import router as junctions_router
from app.api.resources import router as resources_router
from app.api.corridors import router as corridors_router
from app.api.demo import router as demo_router
from app.api.videos import router as videos_router
from app.api.ai import router as ai_router
from app.api.model_metrics import router as model_metrics_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(capabilities_router, tags=["Capabilities"])
api_router.include_router(audit_router, tags=["Audit"])
api_router.include_router(ai_router, tags=["AI Operator Copilot"])
api_router.include_router(model_metrics_router, tags=["Model Metrics"])
api_router.include_router(cameras_router, prefix="/cameras", tags=["Cameras"])
api_router.include_router(incidents_router, prefix="/incidents", tags=["Incidents"])
api_router.include_router(junctions_router, prefix="/junctions", tags=["Junctions"])
api_router.include_router(resources_router, prefix="/resources", tags=["Resources"])
api_router.include_router(corridors_router, prefix="/corridors", tags=["Corridors"])
api_router.include_router(demo_router, prefix="/demo", tags=["Demo Simulation"])
api_router.include_router(videos_router, prefix="/videos", tags=["Videos & Live CV"])

