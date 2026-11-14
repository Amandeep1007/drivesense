# DriveSense

DriveSense is a mobile-first driving companion for live, browser-GPS speed awareness and locally recorded trip insights. This repository is a deployable application foundation; maps, traffic, and ML predictions remain explicitly unavailable until their integrations are configured and validated.

## What works locally

- Next.js, TypeScript, Tailwind CSS, Framer Motion, Lucide, and Recharts frontend.
- FastAPI health, configuration, local-trip-storage, and ML-readiness APIs.
- High-accuracy browser Geolocation API watch started only by the driver's action. Speed comes from the device's GPS `speed` reading; a missing reading stays unavailable.
- Default warning at 100 km/h and caution from 80 km/h. These are configurable application reminders, not legal speed limits.
- Trip distance and metrics recorded only during an active session. Trip history and preferences remain in browser local storage; saved trips do not contain GPS coordinates.
- Dark and light themes, responsive navigation, installable PWA manifest, and an offline navigation fallback that does not cache location or API data.
- Integration points for Google Maps, model readiness, Vercel, Render, and Docker.

## Requirements

- Python 3.11 or newer
- Node.js 20.9 or newer and npm
- HTTPS or `localhost` for browser geolocation. Physical devices must use a secure origin to grant GPS access.

## Quick start (Windows PowerShell)

```powershell
.\scripts\setup.ps1
.\scripts\start.ps1
```

The start script launches the frontend and API as separate processes and opens `http://localhost:3000`. To run either service yourself:

```powershell
# Terminal 1
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --port 8000

# Terminal 2
Set-Location frontend
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env.local` to set the API URL or an optional Google Maps browser key. Copy `backend/.env.example` to `backend/.env` to configure CORS and an optional model artifact path. Never commit secrets; Google Maps keys exposed to the browser must be restricted by API and allowed referrer.

## Tests

```powershell
.\scripts\test.ps1
```

This runs the FastAPI tests, frontend unit tests, TypeScript checks, and a Next.js production build. The focused service tests cover metres/second conversion, missing speed, warning boundaries, GPS error states, and GPS distance calculations. Production Docker installs only `backend/requirements.txt`; setup adds test dependencies from `backend/requirements-dev.txt`.

## Data, privacy, and limitations

- `dataset/driver_behavior_route_anomaly_dataset_with_derived_features.csv` is preserved. Its presence does not make it a trained model. There is no validated model artifact in this workspace; model predictions/classifications are disabled until the exact feature order, preprocessing, target labels, and compatibility are reviewed.
- The research CSV remains on the developer's machine and is excluded from Git deployment uploads; it is not needed to run the current app.
- GPS coordinates are used in memory for the live session and map marker, never saved to trip history or sent to the API. Browser-local trip records include duration, GPS-derived distance, sampled speed, and warning-event counts.
- If you opt into Google Maps by configuring a browser API key, your live position is used by the Google Maps JavaScript SDK to centre the map. Review Google's terms and privacy disclosures before enabling it.
- There is no account, cloud trip database, or PostgreSQL service. No cross-device sync is provided. PostgreSQL should be introduced only with an explicit data-retention and consent design.
- Live maps display only with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and a valid Google Maps JavaScript API setup. Traffic is not simulated or integrated.
- Background GPS is not supported or promised. Keep the DriveSense screen open while a drive is recorded. Do not interact with the phone while driving; DriveSense is not a legal-speed source, navigation system, emergency tool, or safety-critical device.
- Browser storage can be cleared by the user or browser. Export, cloud sync, and account recovery are not implemented.

## Deployment

### Frontend — Vercel

Import the repository into Vercel and set the project root to `frontend`. `frontend/vercel.json` selects the Next.js framework and `npm run build`. Configure:

- `NEXT_PUBLIC_API_URL`: deployed FastAPI base URL, with no trailing slash.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: optional, referrer-restricted Google Maps JavaScript API key.

The browser must be able to reach the API over HTTPS, and the backend CORS allow-list must include the exact production frontend origin.

### Backend — Render / Docker

`render.yaml` and `backend/Dockerfile` define the FastAPI service. Set `DRIVESENSE_CORS_ORIGINS` in Render to a comma-separated allow-list including the deployed frontend origin. Health check: `/api/health`. For local container use:

```powershell
docker build -t drivesense-api .\backend
docker run --rm -p 8000:8000 -e DRIVESENSE_CORS_ORIGINS=http://localhost:3000 drivesense-api
```

No hosted deployment is performed by this repository, and no public deployment is claimed.

## Main endpoints

- `GET /api/health` — API and integration status.
- `GET /api/config` — application defaults and local-storage mode.
- `GET /api/ml/status` — model artifact and validation status; never returns a fabricated prediction.
- `GET /api/trips/storage` — explains that trips stay in the browser.