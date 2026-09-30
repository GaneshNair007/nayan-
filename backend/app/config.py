import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env in workspace root or backend dir
load_dotenv()
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env")))
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))

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
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "models", "nayan_india_v2", "best.pt"))
    )
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY", None)
    OPENAI_ENABLED: bool = os.getenv("OPENAI_ENABLED", "true" if os.getenv("OPENAI_API_KEY") else "false").lower() == "true"
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-6-luna")
    OPENAI_FALLBACK_MODEL: str | None = os.getenv("OPENAI_FALLBACK_MODEL", "gpt-4o")
    OPENAI_TIMEOUT_SECONDS: float = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "15.0"))

settings = Settings()
