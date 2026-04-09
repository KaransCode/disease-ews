import sqlite3
import pandas as pd
import numpy as np
import os
import argparse
from datetime import datetime, timedelta
import sys

# Allow importing from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.utils.db import get_db, execute

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'disease_ews.db')
PROCESSED_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'processed', 'features.csv')

def generate_synthetic_data():
    """Generates 30 days of fake daily_stats data matching the real schema."""
    print("Generating synthetic data...")
    conn = get_db()
    districts = pd.read_sql_query("SELECT id, name FROM districts", conn)
    
    dates = [datetime.now().date() - timedelta(days=x) for x in range(30, 0, -1)]
    records = []
    
    for _, row in districts.iterrows():
        district_id = row['id']
        name = row['name']
        
        for i, d in enumerate(dates):
            # Base cases & weather matching the new schema
            opd = np.random.randint(50, 200)
            dengue = np.random.randint(0, 5)
            malaria = np.random.randint(0, 3)
            cholera = np.random.randint(0, 2)
            rain = np.random.uniform(0.0, 20.0)
            temp_max = np.random.uniform(30.0, 40.0)
            temp_min = temp_max - np.random.uniform(5.0, 10.0)
            humidity = np.random.uniform(40.0, 90.0)
            hosp_load = np.random.uniform(40.0, 95.0)
            
            # Make Ludhiana show an outbreak pattern in the last 7 days
            if name == "Ludhiana" and i > 23:
                opd += int(opd * (i - 20) * 0.2)
                dengue += int((i - 20) * 1.5)
                temp_max = np.random.uniform(38.0, 42.0)
                rain = np.random.uniform(30.0, 60.0) # Heavy rain spike
                hosp_load = np.random.uniform(85.0, 100.0)
                
            records.append((district_id, d, opd, dengue, malaria, cholera, rain, temp_max, temp_min, humidity, hosp_load))
            
    execute("DELETE FROM daily_stats") # Clear old data
    conn = get_db()
    
    # Insert matching the new exact column names
    conn.executemany(
        """INSERT INTO daily_stats 
           (district_id, date, opd_cases, dengue_cases, malaria_cases, cholera_cases, rainfall_mm, temp_max_c, temp_min_c, humidity_pct, hospital_load) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        records
    )
    conn.commit()
    print(f"✅ Generated {len(records)} synthetic records.")

def engineer_features():
    """Reads daily_stats, engineers features, and saves to CSV and SQLite."""
    print("Engineering features...")
    conn = get_db()
    stats = pd.read_sql_query("SELECT * FROM daily_stats", conn)
    districts = pd.read_sql_query("SELECT id, population FROM districts", conn)
    
    if stats.empty:
        print("Error: No data in daily_stats. Run with --generate first.")
        return

    df = pd.merge(stats, districts, left_on='district_id', right_on='id')
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by=['district_id', 'date'])

    # Calculate total cases for the rolling averages
    df['total_cases'] = df['opd_cases'] + df['dengue_cases'] + df['malaria_cases'] + df['cholera_cases']

    # Feature Engineering based on instructions
    df['rolling_7d_avg_cases'] = df.groupby('district_id')['total_cases'].transform(lambda x: x.rolling(7, min_periods=1).mean())
    df['wow_change_pct'] = df.groupby('district_id')['total_cases'].pct_change(periods=7).fillna(0)
    df['cases_per_1000'] = df['opd_cases'] / (df['population'] / 1000)
    df['rainfall_7d_sum'] = df.groupby('district_id')['rainfall_mm'].transform(lambda x: x.rolling(7, min_periods=1).sum())
    
    # 30-day temp_max average deviation
    district_temp_mean = df.groupby('district_id')['temp_max_c'].transform('mean')
    df['temp_deviation'] = df['temp_max_c'] - district_temp_mean
    
    # Anomaly flag (Cases > Mean + 2*STD)
    df['district_mean'] = df.groupby('district_id')['total_cases'].transform('mean')
    df['district_std'] = df.groupby('district_id')['total_cases'].transform('std')
    df['anomaly_flag'] = (df['total_cases'] > (df['district_mean'] + 2 * df['district_std'])).astype(int)
    
    # Target: outbreak_label (1 if cases double in next 7 days)
    df['future_7d_avg'] = df.groupby('district_id')['total_cases'].shift(-7).transform(lambda x: x.rolling(7, min_periods=1).mean())
    df['outbreak_label'] = (df['future_7d_avg'] > (df['rolling_7d_avg_cases'] * 2)).astype(int)
    
    # Rename humidity column to match what train.py expects
    df = df.rename(columns={'humidity_pct': 'humidity'})

    # Clean up and select final features
    df = df.dropna()
    features = ['district_id', 'date', 'rolling_7d_avg_cases', 'wow_change_pct', 
                'cases_per_1000', 'rainfall_7d_sum', 'temp_deviation', 'anomaly_flag', 
                'humidity', 'hospital_load', 'outbreak_label']
    
    # 1. Save to CSV
    os.makedirs(os.path.dirname(PROCESSED_DATA_PATH), exist_ok=True)
    df[features].to_csv(PROCESSED_DATA_PATH, index=False)
    print(f"✅ Features saved to {PROCESSED_DATA_PATH}")
    
    # 2. Save back to SQLite
    df[features].to_sql('processed_features', conn, if_exists='replace', index=False)
    print(f"✅ Features also saved to SQLite 'processed_features' table.")
    
    conn.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--generate', action='store_true', help='Generate synthetic data')
    args = parser.parse_args()
    
    if args.generate:
        generate_synthetic_data()
    engineer_features()