from pathlib import Path

import joblib
import pandas as pd
from features import engineer_features

model = joblib.load(Path(__file__).resolve().parent / "model.pkl")

def predict(hour, day_of_week, semester_progress, weather, temperature) -> float:
    features = engineer_features(hour, day_of_week, semester_progress, weather, temperature)
    X = pd.DataFrame([features])
    prediction = model.predict(X)[0]
    return round(float(prediction), 4)