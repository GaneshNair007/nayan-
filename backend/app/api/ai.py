"""
AI Operator Copilot API Routes.
Provides decision-support assistance for operators without autonomous authority.
"""
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends
from app.config import settings
from app.services.ai_assistant import ai_service
from app.services.ai_context import (
    build_incident_context,
    build_corridor_context,
    build_camera_context
)

router = APIRouter(prefix="/ai", tags=["AI Operator Copilot"])

class AIAssistRequest(BaseModel):
    mode: str = Field(..., description="Operational mode: INCIDENT_BRIEF, EVIDENCE_EXPLANATION, RESPONSE_RECOMMENDATION, DISPATCH_DRAFT, CORRIDOR_EXPLANATION, PUBLIC_ADVISORY_DRAFT, SHIFT_SUMMARY, TECHNICAL_EXPLANATION")
    incident_id: Optional[str] = Field(None, description="Incident identifier")
    corridor_id: Optional[str] = Field(None, description="Corridor plan identifier")
    camera_id: Optional[str] = Field(None, description="Camera identifier")
    operator_question: Optional[str] = Field(None, description="Optional operator contextual question")
    operator: Optional[str] = Field("OPERATOR", description="Callsign of the requesting operator")

@router.get("/status")
def get_ai_status():
    """
    Returns AI Assistant status without exposing secrets.
    """
    configured = ai_service.is_configured()
    return {
        "enabled": settings.OPENAI_ENABLED,
        "configured": configured,
        "available": configured,
        "provider": "openai",
        "model": settings.OPENAI_MODEL,
        "fallback_model": settings.OPENAI_FALLBACK_MODEL,
        "mode": "operator_decision_support",
        "autonomous_actions": False,
        "store_responses": False,
        "api_key_configured": bool(settings.OPENAI_API_KEY)
    }

@router.post("/assist")
async def assist_operator(req: AIAssistRequest):
    """
    Generate structured AI decision-support advice based on authoritative backend state.
    AI CANNOT modify incident state, authorize dispatch, or alter traffic signals.
    """
    # 1. Build structured context strictly from real backend state
    context = {}
    try:
        if req.incident_id:
            context = build_incident_context(req.incident_id)
        elif req.corridor_id:
            context = build_corridor_context(req.corridor_id)
        elif req.camera_id:
            context = build_camera_context(req.camera_id)
        elif req.mode == "SHIFT_SUMMARY":
            from app.services.ai_context import build_shift_summary_context
            context = build_shift_summary_context()
        else:
            raise HTTPException(
                status_code=400,
                detail="Must provide at least one valid entity ID: incident_id, corridor_id, camera_id (or use mode SHIFT_SUMMARY)."
            )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assemble authoritative context: {str(e)}")

    # 2. Attach operator question as untrusted text if provided
    if req.operator_question:
        context["operator_query"] = {
            "question": req.operator_question,
            "provenance": "USER_INPUT"
        }

    # 3. Call AI Assistant Service
    result = await ai_service.generate_assistance(
        mode=req.mode,
        context=context,
        operator=req.operator or "OPERATOR"
    )

    return result
