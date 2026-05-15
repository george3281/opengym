from db import get_client
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import pandas as pd

def fetch_training_data() -> pd.DataFrame:
    client = get_client()

    result = (
        client.table("rec_data")
        .select("hour, day_of_week, semester_progress, weather, temperature, occupancy")
        .neq("semester_progress", -1)     # exclude summer/break readings
        .gte("occupancy", 0)
        .lte("occupancy", 1)
        .order("recorded_at", desc=False)
        .execute()
    )

    df = pd.DataFrame(result.data)
    df = df.drop_duplicates(subset=["hour", "day_of_week", "semester_progress"])
    return df

def fetch_recent(hours: int = 24) -> pd.DataFrame:
    cutoff = (datetime.now(ZoneInfo("America/New_York")) - timedelta(hours=hours)).isoformat()

    client = get_client()
    result = (
        client.table("rec_data")
        .select("hour, day_of_week, semester_progress, weather, temperature, occupancy, recorded_at")
        .gte("recorded_at", cutoff)
        .order("recorded_at", desc=True)
        .execute()
    )

    return pd.DataFrame(result.data)

def fetch_by_hour(hour: int) -> pd.DataFrame:
    client = get_client()
    result = (
        client.table("rec_data")
        .select("hour, day_of_week, semester_progress, weather, temperature, occupancy")
        .eq("hour", hour)
        .neq("semester_progress", -1)
        .order("recorded_at", desc=False)
        .execute()
    )

    return pd.DataFrame(result.data)

def fetch_by_day(day_of_week: int) -> pd.DataFrame:
    client = get_client()
    result = (
        client.table("rec_data")
        .select("hour, day_of_week, semester_progress, weather, temperature, occupancy")
        .eq("day_of_week", day_of_week)
        .neq("semester_progress", -1)
        .order("recorded_at", desc=False)
        .execute()
    )

    return pd.DataFrame(result.data)