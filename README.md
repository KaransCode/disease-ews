# 🏥 Disease Outbreak Early Warning System
**CODEVISTA v1.0 | Health Tech Track | Team Rocket**

An AI-powered web platform that predicts and tracks disease outbreaks across Punjab's 22 districts. By analyzing historical health data and real-time environmental factors (weather, humidity, rainfall), the system generates a 0-100 risk score, providing health officials with a critical 48-72 hour early warning before outbreaks peak.

## 🚀 Key Features
* **Predictive ML Engine:** Uses a custom Voting Classifier (Scikit-Learn Random Forest + XGBoost) to predict outbreak probabilities based on 7-day rolling averages and weather anomalies.
* **Live Heatmap Dashboard:** Interactive React.js & Leaflet map visualizing district-by-district risk levels (Low, Medium, High).
* **Automated Alerting:** Twilio-powered SMS and SMTP Email alerts triggered automatically when a district crosses the "High Risk" threshold.
* **Primary Disease Tracking:** Dynamically identifies the primary concern (Dengue, Malaria, Cholera, or General OPD Spikes).

## 💻 Tech Stack
* **Backend:** Python, Flask, SQLite, APScheduler
* **Machine Learning:** Pandas, NumPy, Scikit-learn, XGBoost, Joblib
* **Frontend:** React.js, Leaflet Maps, Axios
* **External APIs:** Twilio (SMS Alerts), OpenWeatherMap (Data ingestion)

---

## 🗂️ Project Structure

```text
disease-ews/
│
├── backend/
│   ├── app.py                  # Main Flask server
│   ├── init_db.py              # Seeds SQLite database with 22 districts
│   ├── schema.sql              # Database table architectures
│   ├── ingest.py               # Real-time data ingestion pipeline
│   ├── fetch_weather.py        # Weather API helper
│   ├── alerts.py               # Twilio & Email alert logic
│   ├── routes/                 # API Endpoints (districts, scoring, alerts)
│   └── utils/db.py             # SQLite helper functions
│
├── ml_model/
│   ├── process.py              # Feature engineering & data aggregation
│   ├── train.py                # ML Model training script (XGBoost/RF)
│   ├── predict.py              # Generates daily 0-100 risk scores
│   ├── model.pkl               # Trained ensemble model (Joblib)
│   └── scaler.pkl              # Feature scaler
│
├── data/
│   ├── raw/                    # Raw health and weather caches
│   └── processed/              # features.csv for model training
│
└── frontend/                   # React.js web dashboard
    ├── src/components/         # Maps, StatCards, DistrictPanels
    └── src/services/api.js     # Axios API configurations
