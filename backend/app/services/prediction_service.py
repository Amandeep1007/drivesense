import os
from pathlib import Path

from app.schemas.driving import ModelStatus

_DEFAULT_ARTIFACT = Path(__file__).resolve().parents[1] / "models" / "drivesense.joblib"


def get_model_status() -> ModelStatus:
    configured_path = os.getenv("DRIVESENSE_MODEL_PATH")
    artifact_path = Path(configured_path).expanduser() if configured_path else _DEFAULT_ARTIFACT

    if artifact_path.is_file():
        return ModelStatus(
            available=False,
            status="validation_required",
            message=(
                "A model artifact exists, but its feature schema, preprocessing, "
                "labels, and compatibility have not been validated. Predictions are disabled."
            ),
            artifact_name=artifact_path.name,
        )

    return ModelStatus(
        available=False,
        status="artifact_missing",
        message=(
            "No validated DriveSense model artifact is configured. "
            "The supplied dataset is not used to fabricate predictions."
        ),
        artifact_name=artifact_path.name,
    )