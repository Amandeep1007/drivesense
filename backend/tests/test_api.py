from fastapi.testclient import TestClient

from app.main import app
from app.services.prediction_service import get_model_status

client = TestClient(app)


def test_health_reports_browser_gps_and_unavailable_integrations() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "gps_service": "browser_based",
        "ml_service": "unavailable",
        "traffic_service": "not_configured",
    }


def test_configuration_exposes_application_warning_thresholds() -> None:
    response = client.get("/api/config")

    assert response.status_code == 200
    assert response.json()["default_speed_threshold"] == 100
    assert response.json()["caution_speed_threshold"] == 80
    assert response.json()["trip_storage"] == "browser_local"


def test_model_status_never_claims_an_unavailable_model_is_ready() -> None:
    response = client.get("/api/ml/status")

    assert response.status_code == 200
    assert response.json()["available"] is False
    assert response.json()["prediction_supported"] is False
    assert response.json()["validated"] is False


def test_trip_storage_is_device_local() -> None:
    response = client.get("/api/trips/storage")

    assert response.status_code == 200
    assert response.json()["storage"] == "browser_local"


def test_existing_artifact_stays_disabled_until_its_schema_is_validated(
    tmp_path, monkeypatch
) -> None:
    artifact = tmp_path / "candidate.joblib"
    artifact.write_bytes(b"not loaded")
    monkeypatch.setenv("DRIVESENSE_MODEL_PATH", str(artifact))

    status = get_model_status()

    assert status.available is False
    assert status.status == "validation_required"
    assert status.validated is False
    assert status.prediction_supported is False
    assert status.artifact_name == "candidate.joblib"
    assert str(tmp_path) not in status.model_dump_json()
