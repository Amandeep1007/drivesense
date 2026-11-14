import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.prediction import router as prediction_router
from app.api.trips import router as trips_router


def allowed_origins() -> list[str]:
    configured = os.getenv("DRIVESENSE_CORS_ORIGINS")
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    return ["http://localhost:3000", "http://127.0.0.1:3000"]


app = FastAPI(
    title="DriveSense API",
    description="Backend services for the DriveSense driving companion.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(health_router, prefix="/api")
app.include_router(prediction_router, prefix="/api")
app.include_router(trips_router, prefix="/api")


@app.get("/", tags=["health"])
def home() -> dict[str, str]:
    return {
        "application": "DriveSense",
        "message": "DriveSense API is running.",
        "status": "online",
    }
