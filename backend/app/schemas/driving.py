from pydantic import BaseModel, Field


class HealthStatus(BaseModel):
    status: str
    gps_service: str
    ml_service: str
    traffic_service: str


class ApplicationConfig(BaseModel):
    application: str = "DriveSense"
    default_speed_threshold: int = 100
    caution_speed_threshold: int = 80
    speed_unit: str = "km/h"
    gps_provider: str = "browser_geolocation"
    trip_storage: str = "browser_local"
    traffic_provider: str = "not_configured"


class ModelStatus(BaseModel):
    available: bool
    status: str
    message: str
    artifact_name: str | None = None
    validated: bool = Field(default=False)
    prediction_supported: bool = Field(default=False)