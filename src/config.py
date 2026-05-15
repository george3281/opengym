from pathlib import Path

URL = "https://app.safespace.io/api/display/live-occupancy/86fb9e11?view=percent"

SEMESTERS = {
    "fall_2025": {"start": "2025-08-25", "end": "2025-12-13"},
    "spring_2026": {"start": "2026-01-20", "end": "2026-05-10"},
    "fall_2026": {"start": "2026-08-31", "end": "2026-12-20"},
}

WEATHER = {
    "Sunny": 1,
    "Partly cloudy": 2,
    "Cloudy": 3,
    "Rain": 4,
    "Thunderstorm": 5,
    "Snow": 6,
    "Fog": 7,
    "Clear": 8,
}

ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "data" / "rec_data.csv"
SAVE_TO = ROOT / "data" / "rec_data.csv"
