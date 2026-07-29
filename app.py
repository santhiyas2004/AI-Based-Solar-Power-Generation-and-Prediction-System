"""
app.py
------
Sunlytics Flask application entrypoint.

Run with:
    python app.py

The trained model is loaded lazily (on first request) via ModelRegistry,
but we warm it up here at startup so the very first prediction isn't slow
and so any load errors surface immediately instead of on a user's request.
"""

from flask import Flask
from flask_cors import CORS

from routes import api
from model_loader import ModelRegistry


def create_app():
    app = Flask(__name__)
    CORS(app)  # allow the React dev server / built frontend to call the API

    app.register_blueprint(api, url_prefix="/api")

    # Warm up the model + dataset once at startup (no retraining, just load).
    with app.app_context():
        ModelRegistry.get_model()
        ModelRegistry.get_processed_dataset()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
