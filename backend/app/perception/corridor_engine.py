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
        self.feasibility_score = "LOW"  # HIGH, MEDIUM, LOW
        self.recommended_action = "MAINTAIN"
        self.clearance_distance = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ambulance_track_id": self.ambulance_track_id,
            "ambulance_speed": round(self.ambulance_speed, 2),
            "ambulance_position": self.ambulance_position,
            "grid_occupancy": self.grid_occupancy,
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
        # Create a 2D grid to track occupancy density
        grid = np.zeros((self.cells_y, self.cells_x))
        
        vehicles = [t for t in tracks if t.domain_type != "ambulance" and t.domain_type in ["car", "motorcycle", "auto-rickshaw", "bus", "truck", "van"]]
        
        for v in vehicles:
            cx, cy = self._get_cell_index(v.current_centroid[0], v.current_centroid[1])
            # Weight occupancy by vehicle type
            weight = 1.0
            if v.domain_type in ["bus", "truck"]:
                weight = 2.0
            elif v.domain_type in ["motorcycle"]:
                weight = 0.5
            elif v.domain_type in ["auto-rickshaw"]:
                weight = 0.8
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
            
        # 3. Lane Elasticity & Feasibility Scoring
        total_occupancy_ahead = sum([c["occupancy_weight"] for c in ahead_cells[:3]]) if ahead_cells else 0.0
        
        if total_occupancy_ahead < 2.0:
            snapshot.feasibility_score = "HIGH"
            snapshot.recommended_action = "PROCEED_NORMAL"
        elif total_occupancy_ahead < 5.0:
            snapshot.feasibility_score = "MEDIUM"
            snapshot.recommended_action = "COMPRESS_LATERAL"
        else:
            snapshot.feasibility_score = "LOW"
            snapshot.recommended_action = "PREEMPT_JUNCTION"
            
        # 4. Clearance calculation (how many pixels of free space ahead)
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
        Analyzes the active camera feed to determine if the 3.0m minimum clearance
        is actually achieved by calculating lane elasticity and blockages.
        """
        # Count vehicles in the camera's FOV
        vehicles = [t for t in current_tracks if t.domain_type in ["car", "bus", "truck", "van"]]
        two_wheelers = [t for t in current_tracks if t.domain_type in ["motorcycle", "scooter", "auto-rickshaw"]]
        
        # Calculate theoretical clearance based on bounding boxes
        total_vehicle_width_px = sum([v.width for v in vehicles]) + sum([w.width * 0.5 for w in two_wheelers])
        
        # Assume FOV is roughly 12 meters wide
        pixels_per_meter = self.grid_width / 12.0
        used_width_meters = total_vehicle_width_px / pixels_per_meter
        available_width_meters = 12.0 - used_width_meters
        
        # Are there stationary vehicles blocking the center?
        center_blocked = False
        center_x = self.grid_width / 2.0
        for v in vehicles:
            if v.stationary_duration_s > 2.0 and abs(v.current_centroid[0] - center_x) < (self.grid_width * 0.2):
                center_blocked = True
                
        # Determine status
        clearance_width = max(0.0, available_width_meters)
        if center_blocked or clearance_width < 3.0:
            status = "FAILED"
        elif clearance_width >= 3.5:
            status = "CLEARED"
        else:
            status = "COMPRESSING"
            
        return {
            "camera_id": camera_id,
            "verified_by_cctv": True,
            "clearance_width_meters": round(clearance_width, 1),
            "traffic_compression_state": status,
            "center_blocked": center_blocked
        }

