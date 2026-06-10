import os
from datetime import datetime
from zoneinfo import ZoneInfo

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import openmeteo_requests as om
import requests_cache

from config import URL, SEMESTERS, WEATHER
from db import get_client

CHROMIUM_BIN = "/usr/bin/chromium"
CHROMEDRIVER_BIN = "/usr/bin/chromedriver"


def _chrome_options() -> webdriver.ChromeOptions:
    options = webdriver.ChromeOptions()
    if os.path.exists(CHROMIUM_BIN) or os.environ.get("GITHUB_ACTIONS") == "true":
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
    if os.path.exists(CHROMIUM_BIN):
        options.binary_location = CHROMIUM_BIN
    return options


def _chrome_service() -> ChromeService:
    driver_path = os.environ.get("CHROMEDRIVER_PATH", CHROMEDRIVER_BIN)
    if os.path.exists(driver_path):
        return ChromeService(driver_path)
    return ChromeService(ChromeDriverManager().install())


def is_closed_at(hour: int, day_of_week: int) -> bool:
    is_weekend = day_of_week in (5, 6)  # Saturday or Sunday
    if is_weekend and (hour < 10 or hour > 18):
        return True
    if not is_weekend and (hour < 6 or hour > 22):
        return True
    return False


def save_reading():
    now = datetime.now(ZoneInfo("America/New_York"))
    if is_closed_at(now.hour, now.weekday()):
        return None

    semester_progress = fetch_semester_progress(now)
    if (semester_progress == -1):
        return None

    occupancy = fetch_occupancy()
    if occupancy is None:
        return None

    code, temp = fetch_weather()
    
    row = {
        "recorded_at": now.isoformat(),
        "hour": now.hour,
        "day_of_week": now.weekday(),
        "semester_progress": semester_progress,
        "weather": code,
        "temperature": temp,
        "occupancy": occupancy,
    }

    client = get_client()
    try:
        result = client.table("rec_data").insert(row).execute()
        return result
    except Exception as e:
        print(f"Failed to insert row: {e}")
        return None

def fetch_semester_progress(now: datetime) -> float:
    for semester, dates in SEMESTERS.items():
        start = datetime.strptime(dates['start'], '%Y-%m-%d').date()
        end = datetime.strptime(dates['end'], '%Y-%m-%d').date()
        if start <= now.date() <= end:
            total = (end - start).days
            elapsed = (now.date() - start).days
            return round(elapsed / total, 4)
    return -1.0

_session = requests_cache.CachedSession('.weather_cache', expire_after=1800)
_client = om.Client(session=_session)

def fetch_weather(lat: float = 41.8077, lon: float = -72.2526) -> tuple:
    response = _client.weather_api(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "current": ["temperature_2m", "weather_code"],
            "temperature_unit": "fahrenheit",
            "timezone": "America/New_York"
        }
    )[0]
    current = response.Current()
    temp = round(current.Variables(0).Value(), 1)
    code = simplify_wmo(int(current.Variables(1).Value()))
    return code, temp

def simplify_wmo(wmo_code: int) -> int:
    if wmo_code == 0:
        return WEATHER["Clear"]
    elif wmo_code in (1, 2):
        return WEATHER["Partly cloudy"]
    elif wmo_code == 3:
        return WEATHER["Cloudy"]
    elif wmo_code in (45, 48):
        return WEATHER["Fog"]
    elif wmo_code in range(51, 68):
        return WEATHER["Rain"]
    elif wmo_code in range(71, 78):
        return WEATHER["Snow"]
    elif wmo_code in (80, 81, 82):
        return WEATHER["Rain"]
    elif wmo_code in (83, 84):
        return WEATHER["Rain"]
    elif wmo_code in (85, 86):
        return WEATHER["Snow"]
    elif wmo_code in (89, 90):
        return WEATHER["Snow"]
    elif wmo_code in range(91, 100):
        return WEATHER["Thunderstorm"]
    return WEATHER["Cloudy"]

def fetch_occupancy() -> float:
    options = _chrome_options()
    driver = webdriver.Chrome(service=_chrome_service(), options=options)
    driver.get(URL)

    # wait for the element to be present
    try:
        occupants_elem = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.ID, 'occupancyPct'))
        )
        occupants = occupants_elem.text
        return round(int(occupants.strip('%')) / 100, 4)
    finally:
        driver.quit()

if __name__ == '__main__':
    save_reading()