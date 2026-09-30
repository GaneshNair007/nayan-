"""
NAYAN - Dynamic Emergency Yield Corridor Engine
Calculates space availability, dynamic grid slicing, and adaptive lane compression
for heterogeneous Indian traffic (lane-agnostic).
"""
import numpy as np
from typing import List, Dict, Any, Tuple
from app.perception.tracker import TrackedEntity

class CorridorSnapshot:
    def __init__(self):
        self.ambulance_track_id = None
        self.ambulance_speed = 0.0
        self.ambulance_position = (0.0, 0.0)
        self.grid_occupancy = []  # List of dicts representing sliced segments
        self.free_space_ratio = 1.0  # 0.0 to 1.0
        self.lane_elasticity = 1.0   # Compressibility index (0.0 to 1.0)
        self.feasibility_score = "HIGH"  # HIGH, MEDIUM, LOW
        self.recommended_action = "PROCEED_NORMAL"
        self.clearance_distance = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ambulance_track_id": self.ambulance_track_id,
            "ambulance_speed": round(self.ambulance_speed, 2),
            "ambulance_position": self.ambulance_position,
            "grid_occupancy": self.grid_occupancy,
            "free_space_ratio": round(self.free_space_ratio, 3),
            "lane_elasticity": round(self.lane_elasticity, 3),
            "feasibility_score": self.feasibility_score,
            "recommended_action": self.recommended_action,
            "clearance_distance": round(self.clearance_distance, 2)
        }

class DynamicCorridorEngine:
    def __init__(self, grid_width_px=640, grid_height_px=480, cells_x=5, cells_y=5):
        self.grid_width = grid_width_px
        self.grid_height = grid_height_px
        self.cells_x = cells_x
        self.cells_y = cells_y
        self.cell_w = grid_width_px / cells_x
        self.cell_h = grid_height_px / cells_y

    def _get_cell_index(self, x: float, y: float) -> Tuple[int, int]:
        cx = min(max(int(x / self.cell_w), 0), self.cells_x - 1)
        cy = min(max(int(y / self.cell_h), 0), self.cells_y - 1)
        return (cx, cy)

    def extract_corridor_features(self, tracks: List[TrackedEntity], timestamp: float) -> CorridorSnapshot:
        snapshot = CorridorSnapshot()
        
        # 1. Identify Ambulance
        ambulances = [t for t in tracks if t.domain_type == "ambulance"]
        if not ambulances:
            return snapshot
            
        ambulance = ambulances[0] # Take the primary ambulance
        snapshot.ambulance_track_id = ambulance.anonymous_id
        snapshot.ambulance_speed = ambulance.speed
        snapshot.ambulance_position = ambulance.current_centroid
        
        # 2. Dynamic Grid Slicing & Occupancy Grid
        grid = np.zeros((self.cells_y, self.cells_x))
        vehicles = [t for t in tracks if t.domain_type != "ambulance" and t.domain_type in ["car", "motorcycle", "auto-rickshaw", "bus", "truck", "van", "vehicle"]]
        
        total_veh_width = 0.0
        heavy_vehicle_count = 0
        light_vehicle_count = 0

        for v in vehicles:
            cx, cy = self._get_cell_index(v.current_centroid[0], v.current_centroid[1])
            total_veh_width += v.width
            weight = 1.0
            if v.domain_type in ["bus", "truck"]:
                weight = 2.0
                heavy_vehicle_count += 1
            elif v.domain_type in ["motorcycle", "scooter"]:
                weight = 0.5
                light_vehicle_count += 1
            elif v.domain_type in ["auto-rickshaw", "auto_rickshaw"]:
                weight = 0.8
                light_vehicle_count += 1
            else:
                light_vehicle_count += 1
            grid[cy, cx] += weight
            
        # Extract segments directly ahead of the ambulance
        amb_cx, amb_cy = self._get_cell_index(ambulance.current_centroid[0], ambulance.current_centroid[1])
        
        ahead_cells = []
        for y in range(amb_cy - 1, -1, -1): # Assuming y=0 is "forward/up"
            row_occupancy = sum(grid[y, max(0, amb_cx-1):min(self.cells_x, amb_cx+2)])
            ahead_cells.append({
                "y_index": y,
                "occupancy_weight": row_occupancy
            })
            snapshot.grid_occupancy.append({
                "y_index": y,
                "occupancy_weight": float(row_occupancy)
            })
            
        # 3. Free space ratio and Lane Elasticity
        total_ahead_slots = max(1, len(ahead_cells) * 3)
        occupied_ahead_slots = sum([c["occupancy_weight"] for c in ahead_cells]) if ahead_cells else 0.0
        snapshot.free_space_ratio = max(0.0, min(1.0, 1.0 - (occupied_ahead_slots / total_ahead_slots)))

        # Lane elasticity is higher when light vehicles dominate and lower when heavy rigid trucks dominate
        if (heavy_vehicle_count + light_vehicle_count) > 0:
            elasticity = (light_vehicle_count * 0.9 + heavy_vehicle_count * 0.2) / (light_vehicle_count + heavy_vehicle_count)
        else:
            elasticity = 1.0
        snapshot.lane_elasticity = round(max(0.1, min(1.0, elasticity)), 3)

        # 4. Feasibility Scoring & Action
        total_occupancy_ahead = sum([c["occupancy_weight"] for c in ahead_cells[:3]]) if ahead_cells else 0.0
        
        if total_occupancy_ahead < 2.0:
            snapshot.feasibility_score = "HIGH"
            snapshot.recommended_action = "PROCEED_NORMAL"
        elif total_occupancy_ahead < 5.0 and snapshot.lane_elasticity > 0.4:
            snapshot.feasibility_score = "MEDIUM"
            snapshot.recommended_action = "COMPRESS_LATERAL"
        else:
            snapshot.feasibility_score = "LOW"
            snapshot.recommended_action = "PREEMPT_JUNCTION"
            
        # 5. Clearance calculation (how many pixels of free space ahead)
        clearance_cells = 0
        for cell in ahead_cells:
            if cell["occupancy_weight"] < 1.0:
                clearance_cells += 1
            else:
                break
                
        snapshot.clearance_distance = clearance_cells * self.cell_h
        return snapshot

    def verify_segment_cctv(self, camera_id: str, current_tracks: List[TrackedEntity]) -> Dict[str, Any]:
        """
        Implements real-time CCTV verification for a specific road segment.
        Uses CameraCalibration planar homography for calibrated cameras to measure
        exact ground clearance in meters. For uncalibrated cameras, returns normalized
        clearance without fabricating physical metric units.
        """
        from app.perception.calibration import DEMO_CALIBRATIONS, CameraCalibration

        def get_dtype(t):
            return t.get("domain_type", t.get("type", "")) if isinstance(t, dict) else getattr(t, "domain_type", "")

        def get_bottom_center(t):
            if isinstance(t, dict):
                bbox = t.get("bbox", [0, 0, 0, 0])
                centroid = t.get("centroid", [(bbox[0] + bbox[2]) / 2.0, bbox[3]])
                return (centroid[0], bbox[3])
            return (t.current_centroid[0], t.bbox[3])

        def get_width(t):
            if isinstance(t, dict):
                bbox = t.get("bbox", [0, 0, 0, 0])
                return bbox[2] - bbox[0]
            return t.width

        vehicles = [t for t in current_tracks if get_dtype(t) in ["car", "bus", "truck", "van"]]
        two_wheelers = [t for t in current_tracks if get_dtype(t) in ["motorcycle", "scooter", "auto-rickshaw", "auto_rickshaw"]]
        
        # Vehicle bottom centers (ground contact points) and widths
        vehicle_bottom_centers = [get_bottom_center(t) for t in vehicles + two_wheelers]
        vehicle_widths = [get_width(v) for v in vehicles] + [get_width(w) * 0.5 for w in two_wheelers]

        calib = DEMO_CALIBRATIONS.get(camera_id, CameraCalibration(camera_id=camera_id))
        clearance_data = calib.calculate_corridor_clearance(
            vehicle_bottom_centers=vehicle_bottom_centers,
            vehicle_widths_px=vehicle_widths,
            image_width=self.grid_width
        )

        # Center obstruction check
        center_blocked = False
        center_x = self.grid_width / 2.0
        for v in vehicles:
            if isinstance(v, dict):
                stat_dur = v.get("stationary_duration_s", 0.0)
                cx = v.get("centroid", [0, 0])[0]
            else:
                stat_dur = v.stationary_duration_s
                cx = v.current_centroid[0]
            if stat_dur > 2.0 and abs(cx - center_x) < (self.grid_width * 0.2):
                center_blocked = True

        if clearance_data["calibrated"]:
            clearance_val = clearance_data["clearance_meters"]
            if center_blocked or clearance_val < 3.0:
                status = "FAILED"
            elif clearance_val >= 3.5:
                status = "CLEARED"
            else:
                status = "COMPRESSING"
        else:
            norm_clearance = clearance_data["normalized_clearance"]
            if center_blocked or norm_clearance < 0.25:
                status = "FAILED"
            elif norm_clearance >= 0.35:
                status = "CLEARED"
            else:
                status = "COMPRESSING"

        res = {
            "camera_id": camera_id,
            "verified_by_cctv": True,
            "calibrated": clearance_data["calibrated"],
            "physical_units_valid": clearance_data["physical_units_valid"],
            "traffic_compression_state": status,
            "center_blocked": center_blocked,
            "normalized_clearance": clearance_data["normalized_clearance"]
        }

        if clearance_data["calibrated"]:
            res["clearance_width_meters"] = clearance_data["clearance_meters"]
            res["road_width_meters"] = clearance_data["road_width_meters"]
            res["calibration_error_m"] = clearance_data.get("calibration_error_m", 0.0)
        else:
            res["clearance_width_meters"] = None
            res["note"] = clearance_data.get("note", "Uncalibrated camera")

        return res


