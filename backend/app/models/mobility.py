"""
Mobility, Junction, and Signal Control Domain Models
"""
from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime

class TrafficApproach(BaseModel):
    name: str  # Northbound, Southbound, Eastbound, Westbound
    queue_length_meters: float
    vehicle_count: int
    average_speed_kmh: float
    occupancy_pct: float

class SignalPhase(BaseModel):
    phase_id: int
    name: str  # N-S Green, E-W Green, Left Turn Protected, Emergency Corridor Phase
    duration_seconds: int
    active_approaches: List[str]

class SafetyConstraints(BaseModel):
    min_green_seconds: int = 15
    max_green_seconds: int = 90
    yellow_clearance_seconds: int = 4
    all_red_clearance_seconds: int = 2

class JunctionLocation(BaseModel):
    lat: float
    lon: float
    address: str

class Junction(BaseModel):
    id: str
    name: str
    location: JunctionLocation
    approaches: List[TrafficApproach] = []
    pressure: float = 0.0  # 0.0 to 1.0
    current_phase: SignalPhase
    proposed_phase: Optional[SignalPhase] = None
    safety_constraints: SafetyConstraints = SafetyConstraints()
    corridor_active: bool = False
    mode: str = "ADAPTIVE"  # FIXED, ADAPTIVE, CORRIDOR_PREEMPTION

class SignalRecommendationRequest(BaseModel):
    junction_id: Optional[str] = None
    override_reason: Optional[str] = "Adaptive optimization based on traffic pressure"

class SignalRecommendationResponse(BaseModel):
    junction_id: str
    current_phase: SignalPhase
    recommended_phase: SignalPhase
    explanation: str
    pressure_reduction_pct: float
    safety_validated: bool = True
    demo_mode: bool = True

class DigitalTwinScenario(BaseModel):
    scenario_id: str
    name: str
    seed: int
    fixed_avg_delay_s: float
    adaptive_avg_delay_s: float
    delay_reduction_pct: float
    throughput_improvement_pct: float
    simulated_at: str
    is_mocked: bool = True
