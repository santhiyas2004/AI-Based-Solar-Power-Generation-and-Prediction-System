"""
utils.py
--------
Small helper utilities shared across the Flask routes:
 - JSON-file backed prediction history (simple persistence, no DB needed
   for a final-year project demo)
 - Prediction "quality" labeling
 - Dataset analytics helpers (correlation matrix, histogram binning,
   scatter sampling) used by the Analytics page
"""

import os
import json
import uuid
from datetime import datetime

import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HISTORY_PATH = os.path.join(BASE_DIR, "reports", "history.json")


# ---------------------------------------------------------------------------
# Prediction history persistence
# ---------------------------------------------------------------------------
def _ensure_history_file():
    os.makedirs(os.path.dirname(HISTORY_PATH), exist_ok=True)
    if not os.path.exists(HISTORY_PATH):
        with open(HISTORY_PATH, "w") as f:
            json.dump([], f)


def load_history():
    _ensure_history_file()
    with open(HISTORY_PATH, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_history(history):
    _ensure_history_file()
    with open(HISTORY_PATH, "w") as f:
        json.dump(history, f, indent=2)


def append_history(inputs: dict, prediction: float, quality: str):
    history = load_history()
    now = datetime.now()
    entry = {
        "id": str(uuid.uuid4()),
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "inputs": inputs,
        "prediction": round(float(prediction), 4),
        "quality": quality,
    }
    history.insert(0, entry)  # newest first
    save_history(history)
    return entry


def delete_history_entry(entry_id: str) -> bool:
    history = load_history()
    new_history = [h for h in history if h["id"] != entry_id]
    changed = len(new_history) != len(history)
    if changed:
        save_history(new_history)
    return changed


def clear_history():
    save_history([])


# ---------------------------------------------------------------------------
# Prediction quality classification
# ---------------------------------------------------------------------------
def classify_quality(prediction: float, dataset_max: float) -> str:
    """Buckets a predicted output (kWh) into a qualitative label relative to
    the observed range of the training dataset."""
    if dataset_max <= 0:
        dataset_max = 1.0
    ratio = prediction / dataset_max

    if ratio >= 0.7:
        return "Excellent"
    elif ratio >= 0.4:
        return "Good"
    elif ratio >= 0.15:
        return "Average"
    else:
        return "Low"


# ---------------------------------------------------------------------------
# Analytics helpers
# ---------------------------------------------------------------------------
def correlation_matrix(df: pd.DataFrame):
    numeric_df = df.select_dtypes(include=[np.number])
    corr = numeric_df.corr().round(3)
    return {
        "columns": corr.columns.tolist(),
        "matrix": corr.values.tolist(),
    }


def histogram_data(df: pd.DataFrame, column: str, bins: int = 20):
    values = df[column].dropna().values
    counts, edges = np.histogram(values, bins=bins)
    centers = [(edges[i] + edges[i + 1]) / 2 for i in range(len(edges) - 1)]
    return [
        {"bin": round(float(c), 2), "count": int(cnt)}
        for c, cnt in zip(centers, counts)
    ]


def scatter_sample(df: pd.DataFrame, x_col: str, y_col: str, sample_size: int = 400):
    sample = df.sample(n=min(sample_size, len(df)), random_state=42)
    return [
        {"x": round(float(row[x_col]), 3), "y": round(float(row[y_col]), 3)}
        for _, row in sample.iterrows()
    ]
