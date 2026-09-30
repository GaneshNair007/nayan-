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

settings = Settings()
