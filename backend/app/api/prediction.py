from fastapi import APIRouter

from app.schemas.driving import ModelStatus
from app.services.prediction_service import get_model_status

router = APIRouter()


@router.get("/ml/status", response_model=ModelStatus, tags=["machine learning"])
def model_status() -> ModelStatus:
    return get_model_status()