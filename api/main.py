import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import OccupancyResponse, PredictionRequest, PredictionResponse
import model as m

_src = Path(__file__).resolve().parent.parent / "src"
if str(_src) not in sys.path:
    sys.path.insert(0, str(_src))

from fetch_data import fetch_occupancy, is_closed_at  # noqa: E402

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "opengym API",
        "occupancy": "GET /occupancy (live scrape)",
        "predict": "POST /predict with JSON body (see /docs)",
        "docs": "/docs",
    }


@app.get("/occupancy", response_model=OccupancyResponse)
def current_occupancy():
    now = datetime.now(ZoneInfo("America/New_York"))
    if is_closed_at(now.hour, now.weekday()):
        return OccupancyResponse(occupancy=0.0, is_closed=True)
    try:
        occupancy = fetch_occupancy()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Live occupancy unavailable") from exc
    return OccupancyResponse(occupancy=occupancy, is_closed=False)


@app.post("/predict", response_model=PredictionResponse)
@app.post("/", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if is_closed_at(request.hour, request.day_of_week):
        return PredictionResponse(occupancy=0.0, is_closed=True)
    occupancy = m.predict(
        hour=request.hour,
        day_of_week=request.day_of_week,
        semester_progress=request.semester_progress,
        weather=request.weather,
        temperature=request.temperature,
    )
    return PredictionResponse(occupancy=occupancy, is_closed=False)