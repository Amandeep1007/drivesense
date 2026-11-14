from fastapi import APIRouter

from app.schemas.driving import ApplicationConfig, HealthStatus
from app.services.prediction_service import get_model_status

router = APIRouter()


@router.get("/health", response_model=HealthStatus, tags=["health"])
def health_check() -> HealthStatus:
    model_status = get_model_status()
    return HealthStatus(
        status="healthy",
        gps_service="browser_based",
        ml_service="available" if model_status.available else "unavailable",
        traffic_service="not_configured",
    )


@router.get("/config", response_model=ApplicationConfig, tags=["configuration"])
def get_config() -> ApplicationConfig:
    return ApplicationConfig()