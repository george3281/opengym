from query import fetch_training_data
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

def train():
    df = fetch_training_data()

    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
    df['day_sin']  = np.sin(2 * np.pi * df['day_of_week'] / 7)
    df['day_cos']  = np.cos(2 * np.pi * df['day_of_week'] / 7)

    features = ['hour_sin', 'hour_cos', 'day_sin', 'day_cos',
                'semester_progress', 'weather', 'temperature']

    X = df[features]
    y = df['occupancy']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    model.fit(X_train, y_train)
    
    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"MAE: {mae:.4f}")

    importances = pd.Series(model.feature_importances_, index=features)
    print(importances.sort_values(ascending=False))
    
    joblib.dump(model, "model.pkl")
    print("Saved model.pkl")

if __name__ == "__main__":
    train()
    