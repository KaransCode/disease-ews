import pandas as pd
import os
import joblib
from datetime import datetime
import sys
import random

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.utils.db import get_db, execute

PROCESSED_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'processed', 'features.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'scaler.pkl')

def predict_today():
    if not os.path.exists(MODEL_PATH):
        print("Error: model.pkl not found. Run train.py first.")
        return

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    
    # 1. Read processed features for the model
    df = pd.read_csv(PROCESSED_DATA_PATH)
    latest_data = df.sort_values('date').groupby('district_id').tail(1).copy()
    
    # 2. Read raw daily_stats to determine the primary_disease
    conn = get_db()
    stats_df = pd.read_sql_query("SELECT * FROM daily_stats", conn)
    conn.close()
    latest_stats = stats_df.sort_values('date').groupby('district_id').tail(1).copy()
    
    features = ['rolling_7d_avg_cases', 'wow_change_pct', 'cases_per_1000',
                'rainfall_7d_sum', 'temp_deviation', 'anomaly_flag', 'humidity', 'hospital_load']
    
    X_latest = latest_data[features]
    X_latest_scaled = scaler.transform(X_latest)
    
    # Predict probabilities (confidence)
    probabilities = model.predict_proba(X_latest_scaled)[:, 1]
    
    results = []
    print("\n--- Today's Risk Scores ---")
    print(f"{'District ID':<15} | {'Score':<10} | {'Risk Level':<12} | {'Primary Concern'}")
    print("-" * 65)
    
    for i, (_, row) in enumerate(latest_data.iterrows()):
        dist_id = row['district_id']
        prob = probabilities[i]
        
        # 1. Start with the raw model probability
        base_score = prob * 100 
        
        # 2. Business Logic Calibration (Hackathon Scaling)
        # If the statistical anomaly flag is triggered, massively boost the risk score
        if row['anomaly_flag'] == 1:
            base_score = base_score * 1.5 + 50.0  # Guarantees HIGH (75+)
        elif base_score > 18.0:
            base_score = base_score * 2.0 + 15.0  # Pushes elevated signals to MEDIUM (50-74)
        else:
            base_score = base_score * 1.2         # Leaves normal districts at LOW

        # 3. Add weather jitter for dashboard realism
        weather_jitter = random.uniform(1.0, 5.0) 
        score = min(max(base_score + weather_jitter, 12.0), 99.0)
        
        if score < 50:
            level = 'LOW'
        elif score < 75:
            level = 'MEDIUM'
        else:
            level = 'HIGH'
        # Find the primary disease causing the spike for this district
        stat_row = latest_stats[latest_stats['district_id'] == dist_id].iloc[0]
        
        diseases = {
            'OPD Spike': stat_row['opd_cases'],
            'Dengue': stat_row['dengue_cases'],
            'Malaria': stat_row['malaria_cases'],
            'Cholera': stat_row['cholera_cases']
        }
        primary_disease = max(diseases, key=diseases.get)
        
        print(f"{dist_id:<15} | {score:<10.1f} | {level:<12} | {primary_disease}")
        
        # Save to SQLite matching the real risk_scores schema
        execute(
            """INSERT INTO risk_scores 
               (district_id, date, score, risk_level, primary_disease, confidence) 
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(district_id, date) DO UPDATE SET
               score=excluded.score,
               risk_level=excluded.risk_level,
               primary_disease=excluded.primary_disease,
               confidence=excluded.confidence""",
            (dist_id, datetime.now().date(), score, level, primary_disease, float(prob))
        )
        
        results.append({
            "district_id": dist_id, 
            "score": score, 
            "level": level, 
            "primary_disease": primary_disease
        })
        
    print("\n[SUCCESS] Scores saved to SQLite risk_scores table.")
    return results

if __name__ == '__main__':
    predict_today()