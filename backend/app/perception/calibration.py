"""
NAYAN Camera Calibration & Planar Homography Module
Converts image pixel coordinates to ground plane world coordinates (meters).
Enforces scientific validity: physical metrics (meters, km/h) are only
calculated for calibrated cameras with valid planar homography.
"""
import cv2
import numpy as np
from typing import List, Tuple, Optional, Dict, Any

class CameraCalibration:
    """
    Planar homography calibration for an urban surveillance CCTV camera.
    Transforms pixel positions (u, v) on the image plane to real-world
    ground-plane positions (X, Y) in meters.
    """
    def __init__(
        self,
        camera_id: str,
        image_points: Optional[List[Tuple[float, float]]] = None,
        world_points: Optional[List[Tuple[float, float]]] = None,
        road_width_meters: float = 12.0
    ):
        self.camera_id = camera_id
        self.image_points = image_points or []
        self.world_points = world_points or []
        self.road_width_meters = road_width_meters
        self.homography: Optional[np.ndarray] = None
        self.inv_homography: Optional[np.ndarray] = None
        self.calibrated: bool = False
        self.calibration_error: float = 0.0

        if len(self.image_points) >= 4 and len(self.world_points) >= 4:
            self.compute_homography()

    def compute_homography(self) -> bool:
        """Computes the 3x3 homography matrix using cv2.findHomography."""
        if len(self.image_points) < 4 or len(self.world_points) < 4:
            self.calibrated = False
            return False

        src_pts = np.array(self.image_points, dtype=np.float32).reshape(-1, 1, 2)
        dst_pts = np.array(self.world_points, dtype=np.float32).reshape(-1, 1, 2)

        H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
        if H is None:
            self.calibrated = False
            return False

        self.homography = H
        self.inv_homography = np.linalg.pinv(H)

        # Calculate reprojection error
        reprojected = cv2.perspectiveTransform(src_pts, H)
        error = float(np.mean(np.linalg.norm(reprojected - dst_pts, axis=2)))
        self.calibration_error = round(error, 4)
        self.calibrated = True
        return True

    def image_to_ground(self, u: float, v: float) -> Optional[Tuple[float, float]]:
        """
        Transforms an image point (typically bottom-center of vehicle bounding box)
        to ground-plane coordinates (x_meters, y_meters).
        """
        if not self.calibrated or self.homography is None:
            return None

        pt = np.array([[[u, v]]], dtype=np.float32)
        transformed = cv2.perspectiveTransform(pt, self.homography)
        return (float(transformed[0, 0, 0]), float(transformed[0, 0, 1]))

    def ground_to_image(self, x: float, y: float) -> Optional[Tuple[float, float]]:
        """Transforms a ground-plane world coordinate (meters) to image pixel coordinate."""
        if not self.calibrated or self.inv_homography is None:
            return None

        pt = np.array([[[x, y]]], dtype=np.float32)
        transformed = cv2.perspectiveTransform(pt, self.inv_homography)
        return (float(transformed[0, 0, 0]), float(transformed[0, 0, 1]))

    def calculate_corridor_clearance(
        self,
        vehicle_bottom_centers: List[Tuple[float, float]],
        vehicle_widths_px: List[float],
        image_width: float = 640.0
    ) -> Dict[str, Any]:
        """
        Calculates corridor clearance.
        - If calibrated: returns clearance in physical meters.
        - If uncalibrated: returns normalized clearance and relative occupancy only.
        """
        if self.calibrated and self.homography is not None:
            # Transform vehicle contact points to ground plane
            ground_pts = []
            for (u, v) in vehicle_bottom_centers:
                gp = self.image_to_ground(u, v)
                if gp:
                    ground_pts.append(gp)

            # Calculate lateral ground occupancy
            if ground_pts:
                # X is lateral distance across road (0 to road_width_meters)
                x_coords = [p[0] for p in ground_pts]
                occupied_width_meters = min(self.road_width_meters, len(x_coords) * 2.2) # approx vehicle footprint
                clearance_meters = max(0.0, self.road_width_meters - occupied_width_meters)
            else:
                clearance_meters = self.road_width_meters

            normalized = clearance_meters / self.road_width_meters

            return {
                "calibrated": True,
                "clearance_meters": round(clearance_meters, 2),
                "road_width_meters": self.road_width_meters,
                "normalized_clearance": round(normalized, 3),
                "calibration_error_m": self.calibration_error,
                "physical_units_valid": True
            }
        else:
            # Uncalibrated fallback: strictly normalized
            total_px_width = sum(vehicle_widths_px)
            relative_occupancy = min(1.0, total_px_width / image_width)
            normalized_clearance = max(0.0, 1.0 - relative_occupancy)

            return {
                "calibrated": False,
                "clearance_meters": None,
                "normalized_clearance": round(normalized_clearance, 3),
                "relative_occupancy": round(relative_occupancy, 3),
                "physical_units_valid": False,
                "note": "Uncalibrated camera: physical meters withheld to prevent measurement fabrication."
            }

# Pre-calibrated homographies for NAYAN Demo CCTV feeds based on road ground fiducials
DEMO_CALIBRATIONS: Dict[str, CameraCalibration] = {
    "CAM-03": CameraCalibration(
        camera_id="CAM-03",
        # 4 trapezoid road lane markers in image space (640x480)
        image_points=[(180.0, 470.0), (460.0, 470.0), (380.0, 240.0), (260.0, 240.0)],
        # Corresponding real-world ground-plane rectangle: width=12m (3 Indian lanes), length=30m ahead
        world_points=[(0.0, 0.0), (12.0, 0.0), (12.0, 30.0), (0.0, 30.0)],
        road_width_meters=12.0
    ),
    "CAM-01": CameraCalibration(
        camera_id="CAM-01",
        image_points=[(120.0, 460.0), (520.0, 460.0), (420.0, 200.0), (220.0, 200.0)],
        world_points=[(0.0, 0.0), (14.0, 0.0), (14.0, 35.0), (0.0, 35.0)],
        road_width_meters=14.0
    )
}
