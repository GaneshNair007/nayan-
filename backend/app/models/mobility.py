"""
Mobility, Junction, and Signal Control Domain Models with Safety Invariants & Scientific Fair Comparison
"""
from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
from app.models.event import DataProvenance

class TrafficApproach(BaseModel):
    name: str  # Northbound, Southbound, Eastbound, Westbound
    queue_length_meters: float
    vehicle_count: int
    average_speed_kmh: float
    occupancy_pct: float
    provenance: DataProvenance = DataProvenance.SIMULATOR

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
    provenance: DataProvenance = DataProvenance.SIMULATOR

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
    safety_invariants_met: Dict[str, bool] = {
        "min_green_respected": True,
        "max_green_respected": True,
        "yellow_clearance_preserved": True,
        "all_red_clearance_preserved": True,
        "conflicting_green_prevented": True
    }
    provenance: DataProvenance = DataProvenance.SIMULATOR
    demo_mode: bool = True

class DigitalTwinScenario(BaseModel):
    scenario_id: str
    name: str
    seed: int = 48172
    simulation_mode: str = "MOCK"  # "SUMO", "MOCK", "UNAVAILABLE"
    source_label: str = "DIGITAL TWIN MOCKED DEMONSTRATION — deterministic fixture results, not live SUMO"
    
    # Fair Operational Metrics (Identical Network & Demand)
    emergency_travel_time_fixed_s: float
    emergency_travel_time_adaptive_s: float
    
    mean_vehicle_delay_fixed_s: float
    mean_vehicle_delay_adaptive_s: float
    
    mean_queue_length_fixed_m: float
    mean_queue_length_adaptive_m: float
    
    total_stopped_time_fixed_s: float
    total_stopped_time_adaptive_s: float
    
    completed_trips_fixed: int
    completed_trips_adaptive: int
    
    delay_reduction_pct: float
    simulated_at: str
    is_mocked: bool = True
    provenance: DataProvenance = DataProvenance.MOCK
