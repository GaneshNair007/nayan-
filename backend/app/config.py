"""
Backend Configuration Settings
"""
import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AEGIS GRID API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aegis_grid.db")
    CORS_ORIGINS: list = ["*"]
    OSRM_URL: str = os.getenv("OSRM_URL", "http://router.project-osrm.org")
    SUMO_ENABLED: bool = os.getenv("SUMO_ENABLED", "false").lower() == "true"
    DEMO_MODE: bool = True
    NAYAN_DETECTOR_MODEL: str = os.getenv(
        "NAYAN_DETECTOR_MODEL",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "models", "nayan_india", "best.pt"))
    )

settings = Settings()
