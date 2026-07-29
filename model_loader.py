"""
model_loader.py
----------------
Loads the pre-trained Random Forest model (solar_power_model.pkl) ONCE at
application startup and exposes it (plus the dataset used to train it) to
the rest of the backend.

IMPORTANT: This project NEVER retrains the model. It only loads the
artifact produced by the original Jupyter Notebook and reuses it exactly
as-is, together with the exact preprocessing / feature order used during
training.
"""

import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "solar_power_model.pkl")
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "solar_dataset.csv")

# Exact feature order the model was trained on (from the notebook).
# X = data.drop("Solar_Power_Output", axis=1) after:
#   1. dropping Record_ID, Operator_Name, Installation_ID
#   2. deriving Hour from Time and dropping Time
FEATURE_ORDER = [
    "Solar_Irradiance",
    "Panel_Temperature",
    "Ambient_Temperature",
    "Cloud_Cover",
    "Humidity",
    "Wind_Speed",
    "Rainfall",
    "Dust_Level",
    "Panel_Efficiency",
    "Inverter_Efficiency",
    "Hour",
]

TARGET_COLUMN = "Solar_Power_Output"

# Metrics captured from the original notebook run (GridSearchCV, cv=5,
# scoring='r2') on the 80/20 train/test split, random_state=42.
TRAINING_METRICS = {
    "r2_score": 0.9558810122556503,
    "mae": 0.07872538729988716,
    "mse": 0.009343896666850445,
    "rmse": 0.09666383329275974,
    "best_params": {
        "criterion": "squared_error",
        "max_depth": 10,
        "n_estimators": 200,
    },
}


class ModelRegistry:
    """Singleton-style holder so the model + dataset are read from disk once."""

    _model = None
    _dataset = None
    _processed_dataset = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            cls._model = joblib.load(MODEL_PATH)
        return cls._model

    @classmethod
    def get_raw_dataset(cls):
        if cls._dataset is None:
            cls._dataset = pd.read_csv(DATASET_PATH)
        return cls._dataset

    @classmethod
    def get_processed_dataset(cls):
        """Applies the exact same cleaning steps used in the notebook:
        drop identifier columns, derive Hour from Time, drop Time."""
        if cls._processed_dataset is None:
            df = cls.get_raw_dataset().copy()
            df = df.drop(
                columns=["Record_ID", "Operator_Name", "Installation_ID"],
                errors="ignore",
            )
            if "Time" in df.columns:
                df["Hour"] = pd.to_datetime(df["Time"], format="%H:%M").dt.hour
                df = df.drop(columns=["Time"])
            cls._processed_dataset = df
        return cls._processed_dataset


def build_feature_frame(payload: dict) -> pd.DataFrame:
    """Convert an incoming JSON payload into a single-row DataFrame that
    matches FEATURE_ORDER exactly (same names, same order) as used during
    training. Raises ValueError if a required field is missing."""
    missing = [f for f in FEATURE_ORDER if f not in payload]
    if missing:
        raise ValueError(f"Missing required field(s): {', '.join(missing)}")

    row = {feature: float(payload[feature]) for feature in FEATURE_ORDER}
    return pd.DataFrame([row], columns=FEATURE_ORDER)
