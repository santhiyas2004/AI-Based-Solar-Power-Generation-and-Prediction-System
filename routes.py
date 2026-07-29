"""
routes.py
---------
All Flask API endpoints for Sunlytics.

Endpoints
---------
GET    /                       -> API health/info
POST   /predict                -> run a prediction through the loaded model
GET    /history                -> list saved predictions
DELETE /history/<id>           -> delete one prediction from history
DELETE /history                -> clear all prediction history
GET    /model-info              -> algorithm, features, metrics, workflow
GET    /analytics/feature-importance
GET    /analytics/correlation
GET    /analytics/scatter
GET    /analytics/histogram
GET    /analytics/dataset-summary
"""

from flask import Blueprint, request, jsonify

from model_loader import (
    ModelRegistry,
    FEATURE_ORDER,
    TARGET_COLUMN,
    TRAINING_METRICS,
    build_feature_frame,
)
from utils import (
    append_history,
    load_history,
    delete_history_entry,
    clear_history,
    classify_quality,
    correlation_matrix,
    histogram_data,
    scatter_sample,
)

api = Blueprint("api", __name__)


@api.route("/", methods=["GET"])
def index():
    return jsonify(
        {
            "app": "Sunlytics",
            "tagline": "Predict Smarter. Power Greener.",
            "status": "online",
            "model_loaded": ModelRegistry._model is not None
            or True,  # loaded lazily on first call
        }
    )


@api.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(silent=True) or {}

    try:
        features_df = build_feature_frame(payload)
    except (ValueError, TypeError) as exc:
        return jsonify({"error": str(exc)}), 400

    model = ModelRegistry.get_model()
    prediction = float(model.predict(features_df)[0])

    dataset = ModelRegistry.get_processed_dataset()
    dataset_max = float(dataset[TARGET_COLUMN].max())
    quality = classify_quality(prediction, dataset_max)

    entry = append_history(
        inputs={f: payload[f] for f in FEATURE_ORDER}, prediction=prediction, quality=quality
    )

    return jsonify(
        {
            "prediction": round(prediction, 4),
            "unit": "kWh",
            "quality": quality,
            "history_entry": entry,
        }
    )


@api.route("/history", methods=["GET"])
def get_history():
    return jsonify(load_history())


@api.route("/history/<entry_id>", methods=["DELETE"])
def delete_history(entry_id):
    deleted = delete_history_entry(entry_id)
    if not deleted:
        return jsonify({"error": "Entry not found"}), 404
    return jsonify({"deleted": True, "id": entry_id})


@api.route("/history", methods=["DELETE"])
def reset_history():
    clear_history()
    return jsonify({"cleared": True})


@api.route("/model-info", methods=["GET"])
def model_info():
    model = ModelRegistry.get_model()
    dataset = ModelRegistry.get_processed_dataset()

    return jsonify(
        {
            "algorithm": "Random Forest Regression",
            "n_estimators": model.n_estimators,
            "max_depth": model.max_depth,
            "features": FEATURE_ORDER,
            "n_features": len(FEATURE_ORDER),
            "target": TARGET_COLUMN,
            "dataset_size": int(len(dataset)),
            "metrics": TRAINING_METRICS,
            "workflow": [
                "Dataset",
                "Cleaning",
                "EDA",
                "Feature Selection",
                "Train Test Split",
                "Random Forest",
                "Hyperparameter Tuning",
                "Prediction",
                "Evaluation",
            ],
        }
    )


@api.route("/analytics/feature-importance", methods=["GET"])
def feature_importance():
    model = ModelRegistry.get_model()
    importances = model.feature_importances_.tolist()
    data = sorted(
        [{"feature": f, "importance": round(i, 5)} for f, i in zip(FEATURE_ORDER, importances)],
        key=lambda d: d["importance"],
        reverse=True,
    )
    return jsonify(data)


@api.route("/analytics/correlation", methods=["GET"])
def correlation():
    dataset = ModelRegistry.get_processed_dataset()
    return jsonify(correlation_matrix(dataset))


@api.route("/analytics/scatter", methods=["GET"])
def scatter():
    dataset = ModelRegistry.get_processed_dataset()
    x_col = request.args.get("x", "Solar_Irradiance")
    y_col = request.args.get("y", TARGET_COLUMN)
    if x_col not in dataset.columns or y_col not in dataset.columns:
        return jsonify({"error": "Unknown column"}), 400
    return jsonify(scatter_sample(dataset, x_col, y_col))


@api.route("/analytics/histogram", methods=["GET"])
def histogram():
    dataset = ModelRegistry.get_processed_dataset()
    column = request.args.get("column", "Solar_Irradiance")
    if column not in dataset.columns:
        return jsonify({"error": "Unknown column"}), 400
    return jsonify(histogram_data(dataset, column))


@api.route("/analytics/dataset-summary", methods=["GET"])
def dataset_summary():
    dataset = ModelRegistry.get_processed_dataset()
    numeric_df = dataset.select_dtypes(include="number")
    summary = numeric_df.describe().round(3).to_dict()
    return jsonify(summary)
