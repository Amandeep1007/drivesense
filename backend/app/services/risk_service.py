from app.schemas.driving import ModelStatus
from app.services.prediction_service import get_model_status


def risk_model_availability() -> ModelStatus:
    return get_model_status()