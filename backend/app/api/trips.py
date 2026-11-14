from fastapi import APIRouter

router = APIRouter()


@router.get("/trips/storage", tags=["trips"])
def trip_storage_status() -> dict[str, str]:
    return {
        "storage": "browser_local",
        "message": "Trip records are stored on this device and are not uploaded.",
    }