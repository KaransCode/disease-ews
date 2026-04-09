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




🛠️ Installation & Setup
1. Prerequisites
Python 3.8+ (64-bit required for ML libraries) Node.js v16 +  Git

2. Clone the Repository
git clone [https://github.com/KaransCode/disease-ews.git](https://github.com/Karanscode/disease-ews.git)


3. Backend & ML Setup
(Python)Create a virtual environment and install the required dependencies

 Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
4. Environment Variables
Create a .env file in the root directory and add your credentials:
Code snippetFLASK_ENV=development
PORT=5000
SECRET_KEY=your_secret_key
DB_PATH=backend/disease_ews.db

# Alerting
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890


5. Initialize the Database
Seed the SQLite database with Punjab's 22 districts and their geographic coordinates:
Bash
python backend/init_db.py

⚙️ Running the System
Step 1: Generate Data & Train the Model
If you do not have real historical data yet, use the --generate flag to create 30 days of synthetic data for the ML model to train on.
# 1. Engineer features (or generate synthetic data)

python ml_model/process.py --generate

# 2. Train the XGBoost + Random Forest models
python ml_model/train.py

# 3. Generate today's risk scores and save to SQLite
python ml_model/predict.py

Step 2: Start the Backend ServerBashpython backend/app.py
The API will be available at http://localhost:5000.
Verify it is running by visiting http://localhost:5000/api/health.

Step 3: Start the Frontend DashboardOpen a new terminal window:
Bash
cd frontend
npm install
npm start

The React dashboard will be available at http://localhost:3000.📡 Core API EndpointsMethodEndpointDescriptionGET/api/healthSystem health checkGET/api/districts
Returns all 22 districts with geo-coordinatesGET/api/districts/<id>/scoresReturns historical and current risk scores for a specific district
POST/api/alerts/triggerManually forces an alert check for High-Risk districts👥

Team Rocket Contributors
Karan Singh — Machine Learning Pipeline & Feature Engineering
Vishal Mehta — Flask API Architecture & Automated Alerting
Arpit — Data Collection Pipelines & Database Schema
Tanya — React Dashboard UI/UX & Map Integration
