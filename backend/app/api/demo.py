"""
Demo Scenarios & Simulation Controls API
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.incident import Incident
from app.models.mobility import DigitalTwinScenario
from app.models.event import AuditEvent
from app.services.simulation import SimulationService
from app.database import db

router = APIRouter()

@router.post("/scenarios/{scenario}/start")
async def start_scenario(scenario: str):
    s_clean = scenario.lower().strip()
    if s_clean in ["golden", "golden-demo", "collision"]:
        inc = await SimulationService.run_golden_demo()
        return {"status": "started", "scenario": "golden-demo", "incident": inc}
    elif s_clean in ["crowd", "crowd-anomaly"]:
        inc = await SimulationService.run_crowd_scenario()
        return {"status": "started", "scenario": "crowd-anomaly", "incident": inc}
    elif s_clean in ["baggage", "unattended-baggage"]:
        inc = await SimulationService.run_baggage_scenario()
        return {"status": "started", "scenario": "unattended-baggage", "incident": inc}
    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario '{scenario}'. Supported: 'golden', 'crowd', 'baggage'")

@router.post("/reset")
def reset_demo():
    return SimulationService.reset_simulation()

@router.get("/digital-twin", response_model=DigitalTwinScenario)
def get_digital_twin_metrics(scenario_id: str = "scen-golden"):
    return SimulationService.get_digital_twin_metrics(scenario_id)

@router.get("/audits", response_model=List[AuditEvent])
def get_audit_trail():
    return db.audit_events
