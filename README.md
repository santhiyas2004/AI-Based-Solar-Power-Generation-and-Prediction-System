# ☀️ Sunlytics — AI Powered Solar Power Prediction System

> **Predict Smarter. Power Greener.**

Sunlytics is a full-stack, production-quality AI web application that serves predictions from a
**pre-trained Random Forest Regression model** for solar power output — built as a final-year
engineering project. It ships as a professional SaaS-style dashboard rather than a bare notebook demo:
live prediction, model explainability, analytics, and prediction history are all first-class pages.

The model is **never retrained** by this application. `backend/models/solar_power_model.pkl` is loaded
once at startup with `joblib.load()` and reused exactly as produced by the original notebook
(`Sunlytics.ipynb`), with the same feature order and preprocessing.

---

## ✨ Features

- **Dashboard** — live date/time, model summary, and four animated stat cards.
- **Prediction** — a validated, tooltip-annotated form for all 11 model features, instant inference,
  quality rating, and a downloadable PDF report.
- **Analytics** — feature importance, correlation heatmap, irradiance-vs-output scatter plot (with your
  latest prediction highlighted), histograms, prediction trend, and R² / MAE / MSE / RMSE cards.
- **Prediction History** — searchable table of every prediction, with delete and CSV export.
- **AI Model** — algorithm details, features used, workflow diagram, evaluation metrics.
- **Settings** — light/dark mode, reset history, about the developer.

---

## 🧱 Tech Stack

**Frontend:** React.js · Tailwind CSS · React Router · Framer Motion · React Icons · Recharts · Axios · jsPDF

**Backend:** Python · Flask · Flask-CORS · scikit-learn · pandas · NumPy · joblib

---

## 📁 Folder Structure

```
Sunlytics/
├── frontend/
│   ├── src/
│   │   ├── components/     # Sidebar, Topbar, StatCard, Logo, Loaders, Tooltip, FormField...
│   │   ├── pages/           # Dashboard, Prediction, Analytics, History, AIModel, Settings, NotFound
│   │   ├── hooks/            # useTheme, useToast
│   │   ├── services/         # api.js (Axios client)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── app.py               # Flask entrypoint
│   ├── routes.py             # All API endpoints
│   ├── model_loader.py       # Loads the trained model once, feature order
│   ├── utils.py               # History persistence, analytics helpers
│   ├── requirements.txt
│   ├── models/
│   │   └── solar_power_model.pkl
│   ├── dataset/
│   │   └── solar_dataset.csv
│   └── reports/               # prediction history persisted here (history.json)
├── README.md
└── .gitignore
```

---

## 🚀 Installation & Running

### 1. Backend (Flask API)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API starts on **http://localhost:5000** and loads the model once at startup.

### 2. Frontend (React + Vite)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs on **http://localhost:5173** and proxies `/api/*` requests to the Flask backend
(see `vite.config.js`).

> Build for production with `npm run build` — the compiled files land in `frontend/dist/`, ready to be
> served by any static host or by Flask itself.

---

## 🔌 API Reference

| Method | Endpoint                          | Description                              |
|--------|------------------------------------|-------------------------------------------|
| GET    | `/api/`                            | Health check                              |
| POST   | `/api/predict`                     | Run inference, returns prediction + quality |
| GET    | `/api/history`                     | List saved predictions                    |
| DELETE | `/api/history/<id>`                | Delete one prediction                     |
| DELETE | `/api/history`                     | Clear all prediction history              |
| GET    | `/api/model-info`                  | Algorithm, features, metrics, workflow    |
| GET    | `/api/analytics/feature-importance`| Random Forest feature importances         |
| GET    | `/api/analytics/correlation`       | Full correlation matrix                   |
| GET    | `/api/analytics/scatter`           | Scatter sample (`?x=&y=`)                 |
| GET    | `/api/analytics/histogram`         | Histogram bins (`?column=`)               |
| GET    | `/api/analytics/dataset-summary`   | `describe()` summary of the dataset       |

### Feature order (exactly as trained)

```
Solar_Irradiance, Panel_Temperature, Ambient_Temperature, Cloud_Cover, Humidity,
Wind_Speed, Rainfall, Dust_Level, Panel_Efficiency, Inverter_Efficiency, Hour
```

### Model performance (from the original notebook run)

| R² Score | MAE     | MSE     | RMSE    |
|----------|---------|---------|---------|
| 0.9559   | 0.0787  | 0.0093  | 0.0967  |

Best hyperparameters (GridSearchCV, `cv=5`, `scoring='r2'`): `n_estimators=200`, `max_depth=10`,
`criterion='squared_error'`.

---

## 🖼️ Screenshots

_Add screenshots of the Dashboard, Prediction, and Analytics pages here once the app is running._

---

## 🔮 Future Enhancements

- User authentication and per-user prediction history
- Real-time weather API integration to auto-fill irradiance/temperature/humidity
- Model versioning and A/B comparison between retrained models
- Deployment guide (Docker Compose for frontend + backend)
- Push notifications for extreme low-output forecasts

---

## ⚠️ Important Notes

- The model is **loaded, never retrained**. Do not call `.fit()` anywhere in the backend.
- Preprocessing and feature order match the original notebook exactly — see `model_loader.py`.
- Prediction history is stored in a simple JSON file (`backend/reports/history.json`) for demo
  simplicity; swap in a real database for production use.
