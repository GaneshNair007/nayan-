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

@router.get("/scenarios")
def list_scenarios():
    return [
        {
            "id": "golden-demo",
            "name": "Collision on CAM-04 & Emergency Preemption",
            "description": "Multi-frame collision verification, lane obstruction, adaptive signal timing, and AMB-03 green corridor.",
            "camera_id": "CAM-04",
            "default_seed": 48172
        },
        {
            "id": "crowd-anomaly",
            "name": "Crowd Density Surge on CAM-05",
            "description": "Pedestrian accumulation and directional convergence near Metro Entrance B without intent classification.",
            "camera_id": "CAM-05",
            "default_seed": 48172
        },
        {
            "id": "unattended-baggage",
            "name": "Unattended Baggage at Bus Terminal on CAM-06",
            "description": "Persistent spatial owner separation and stationary duration > 180s.",
            "camera_id": "CAM-06",
            "default_seed": 48172
        }
    ]

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

@router.post("/pause")
def pause_demo():
    return {"status": "paused", "message": "Demo replay paused."}

@router.post("/step")
def step_demo():
    return {"status": "stepped", "message": "Demo advanced 1 frame / 1 second."}

@router.post("/reset")
def reset_demo():
    return SimulationService.reset_simulation()

@router.get("/digital-twin", response_model=DigitalTwinScenario)
def get_digital_twin_metrics(scenario_id: str = "scen-golden", mode: str = "MOCK"):
    return SimulationService.get_digital_twin_metrics(scenario_id, mode=mode)
