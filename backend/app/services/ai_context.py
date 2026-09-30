"""
AI Context Builder for NAYAN Operator Copilot.
Assembles authoritative, structured context strictly from current backend state.
Distinguishes data provenance (INFERENCE, DERIVED, SIMULATOR, REPLAY_FIXTURE, MOCK, ESTIMATE, USER_INPUT).
"""
import math
from typing import Dict, Any, List, Optional
from app.database import db
from app.models.incident import Incident, VerificationState, ResponseState
from app.models.response import Resource, ResourceStatus

def _sanitize_provenance(prov: Any) -> str:
    if hasattr(prov, "value"):
        return str(prov.value)
    return str(prov) if prov else "UNKNOWN"

def build_incident_context(incident_id: str) -> Dict[str, Any]:
    """
    Builds structured, authoritative context for an incident.
    Raises KeyError if incident does not exist in backend database.
    """
    inc: Optional[Incident] = db.get_incident(incident_id)
    if not inc:
        raise KeyError(f"Incident '{incident_id}' not found in database.")

    # 1. Authoritative incident data
    incident_data = {
        "id": inc.id,
        "type": inc.type.value if hasattr(inc.type, "value") else str(inc.type),
        "title": inc.title,
        "description": inc.description,
        "camera_id": inc.camera_id,
        "location": {
            "lat": inc.location.lat,
            "lon": inc.location.lon,
            "address": inc.location.address,
            "junction_id": inc.location.junction_id
        },
        "verification_state": inc.verification_state.value if hasattr(inc.verification_state, "value") else str(inc.verification_state),
        "response_state": inc.response_state.value if hasattr(inc.response_state, "value") else str(inc.response_state),
        "severity": inc.severity.value if hasattr(inc.severity, "value") else str(inc.severity),
        "priority_tier": inc.priority_tier,
        "priority_score": inc.priority_score,
        "priority_reasons": inc.priority_reasons,
        "model_confidence": inc.model_confidence,
        "evidence_score": inc.evidence_score,
        "affected_lanes": inc.affected_lanes,
        "estimated_people_affected": inc.estimated_people_affected,
        "created_at": inc.created_at,
        "updated_at": inc.updated_at,
        "provenance": _sanitize_provenance(inc.provenance)
    }

    # 2. Evidence items
    evidence_items = []
    for ev in inc.evidence:
        evidence_items.append({
            "id": ev.id,
            "type": ev.type,
            "source": ev.source,
            "timestamp": ev.timestamp,
            "confidence_score": ev.confidence_score,
            "provenance": _sanitize_provenance(ev.provenance),
            "details": ev.details
        })

    # 3. Associated Camera Telemetry
    camera_data = None
    if inc.camera_id and inc.camera_id in db.cameras:
        cam = db.cameras[inc.camera_id]
        camera_data = {
            "id": cam.id,
            "name": cam.name,
            "status": cam.status.value if hasattr(cam.status, "value") else str(cam.status),
            "fps": cam.fps,
            "health_score": cam.health_score,
            "detections_count": cam.current_detections_count,
            "provenance": _sanitize_provenance(cam.provenance)
        }

    # 4. Ranked Resource Availability with Euclidean distance calculation
    ranked_resources = []
    for r in db.resources.values():
        dist_km = math.sqrt((r.location.lat - inc.location.lat)**2 + (r.location.lon - inc.location.lon)**2) * 111.0
        ranked_resources.append({
            "id": r.id,
            "callsign": r.callsign,
            "type": r.type.value if hasattr(r.type, "value") else str(r.type),
            "status": r.status.value if hasattr(r.status, "value") else str(r.status),
            "location_address": r.location.address,
            "approx_distance_km": round(dist_km, 2),
            "eta_seconds": r.eta_seconds,
            "provenance": _sanitize_provenance(r.provenance)
        })
    ranked_resources.sort(key=lambda x: (x["status"] != "AVAILABLE", x["approx_distance_km"]))

    # 5. Associated Corridor Plan
    corridor_data = None
    for cp in db.corridor_plans.values():
        if cp.incident_id == incident_id:
            corridor_data = {
                "id": cp.id,
                "status": cp.status.value if hasattr(cp.status, "value") else str(cp.status),
                "resource_id": cp.resource_id,
                "is_rerouted": cp.is_rerouted,
                "junctions": [
                    {
                        "junction_id": j.junction_id,
                        "name": j.junction_name,
                        "readiness": j.readiness,
                        "eta_seconds": j.eta_seconds
                    }
                    for j in cp.junction_sequence
                ],
                "segments": [
                    {
                        "segment_id": s.segment_id,
                        "camera_id": s.camera_id,
                        "compression_state": s.traffic_compression_state,
                        "clearance_meters": s.clearance_width_meters,
                        "verified_by_cctv": s.verified_by_cctv
                    }
                    for s in cp.segment_sequence
                ]
            }
            break

    # 6. Recent Audit Events for this incident
    recent_audits = []
    for a in db.audit_events:
        if a.entityId == incident_id or (a.details and a.details.get("incident_id") == incident_id):
            recent_audits.append({
                "action": a.action,
                "actor": a.actor,
                "timestamp": a.timestamp,
                "previous_state": a.previousState,
                "next_state": a.nextState,
                "reason": a.reason,
                "provenance": _sanitize_provenance(a.provenance)
            })

    return {
        "context_entity": "INCIDENT",
        "incident": incident_data,
        "evidence": evidence_items,
        "camera": camera_data,
        "available_resources": ranked_resources[:4],
        "corridor": corridor_data,
        "recent_audit_history": recent_audits[:5]
    }

def build_corridor_context(corridor_id: str) -> Dict[str, Any]:
    """
    Builds context for an active emergency mobility corridor.
    """
    cp = db.corridor_plans.get(corridor_id)
    if not cp:
        raise KeyError(f"Corridor plan '{corridor_id}' not found.")

    res = db.resources.get(cp.resource_id)
    inc = db.incidents.get(cp.incident_id)

    return {
        "context_entity": "CORRIDOR",
        "corridor_id": cp.id,
        "status": cp.status.value if hasattr(cp.status, "value") else str(cp.status),
        "resource": {
            "id": res.id if res else cp.resource_id,
            "callsign": res.callsign if res else "Unknown",
            "type": res.type.value if res and hasattr(res.type, "value") else "AMBULANCE",
            "eta_seconds": res.eta_seconds if res else None
        } if res else None,
        "incident": {
            "id": inc.id if inc else cp.incident_id,
            "type": inc.type.value if inc and hasattr(inc.type, "value") else "COLLISION",
            "severity": inc.severity.value if inc and hasattr(inc.severity, "value") else "HIGH",
            "location": inc.location.address if inc else "Unknown"
        } if inc else None,
        "is_rerouted": cp.is_rerouted,
        "junction_sequence": [
            {
                "junction_id": j.junction_id,
                "name": j.junction_name,
                "readiness": j.readiness,
                "eta_seconds": j.eta_seconds
            }
            for j in cp.junction_sequence
        ],
        "segments": [
            {
                "segment_id": s.segment_id,
                "camera_id": s.camera_id,
                "compression_state": s.traffic_compression_state,
                "clearance_meters": s.clearance_width_meters,
                "verified_by_cctv": s.verified_by_cctv
            }
            for s in cp.segment_sequence
        ]
    }

def build_camera_context(camera_id: str) -> Dict[str, Any]:
    """
    Builds telemetry context for a specific camera sensor.
    """
    cam = db.cameras.get(camera_id)
    if not cam:
        raise KeyError(f"Camera '{camera_id}' not found.")

    active_incidents = [
        {
            "id": i.id,
            "type": i.type.value if hasattr(i.type, "value") else str(i.type),
            "state": i.verification_state.value if hasattr(i.verification_state, "value") else str(i.verification_state),
            "priority": i.priority_tier
        }
        for i in db.incidents.values() if i.camera_id == camera_id
    ]

    return {
        "context_entity": "CAMERA",
        "camera_id": cam.id,
        "name": cam.name,
        "status": cam.status.value if hasattr(cam.status, "value") else str(cam.status),
        "location": {
            "lat": cam.location.lat,
            "lon": cam.location.lon,
            "address": cam.location.address,
            "junction_id": cam.location.junction_id
        },
        "fps": cam.fps,
        "health_score": cam.health_score,
        "current_detections": cam.current_detections_count,
        "provenance": _sanitize_provenance(cam.provenance),
        "associated_incidents": active_incidents
    }

def build_shift_summary_context() -> Dict[str, Any]:
    """
    Builds authoritative system-wide shift summary context from database state.
    """
    all_incidents = list(db.incidents.values())
    confirmed_incidents = [i for i in all_incidents if hasattr(i, "verification_state") and (i.verification_state.value if hasattr(i.verification_state, "value") else str(i.verification_state)) == "CONFIRMED"]
    dispatched_incidents = [i for i in all_incidents if hasattr(i, "response_state") and (i.response_state.value if hasattr(i.response_state, "value") else str(i.response_state)) == "DISPATCHED"]
    
    return {
        "context_entity": "SYSTEM_SHIFT",
        "total_incidents_count": len(all_incidents),
        "confirmed_incidents_count": len(confirmed_incidents),
        "dispatched_incidents_count": len(dispatched_incidents),
        "active_corridors_count": len(db.corridors),
        "total_cameras_count": len(db.cameras),
        "resources": [
            {
                "id": r.id,
                "type": r.type.value if hasattr(r.type, "value") else str(r.type),
                "status": r.status.value if hasattr(r.status, "value") else str(r.status)
            }
            for r in db.resources.values()
        ],
        "incidents": [
            {
                "id": i.id,
                "type": i.type.value if hasattr(i.type, "value") else str(i.type),
                "verification_state": i.verification_state.value if hasattr(i.verification_state, "value") else str(i.verification_state),
                "response_state": i.response_state.value if hasattr(i.response_state, "value") else str(i.response_state),
                "camera_id": i.camera_id
            }
            for i in all_incidents
        ]
    }
