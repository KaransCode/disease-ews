import argparse
import random
from datetime import datetime
from utils.db import get_db_connection
from fetch_weather import fetch_weather_for_districts

def generate_health_logic(w, dist_name, is_demo=False):
    """Generates synthetic health metrics based on weather and demo flags."""
    # Base numbers based on population-like scaling
    # (High ID districts like Ludhiana usually have higher populations in seed scripts)
    pop_factor = 1.0 + (w['district_id'] / 10.0) 
    
    opd = int(random.randint(100, 300) * pop_factor)
    dengue = int((w['rainfall_mm'] / 10) + random.randint(0, 5))
    malaria = int(random.randint(2, 10) if w['district_id'] > 15 else random.randint(0, 3))
    cholera = 0
    
    # Logic: High rain + High Humidity = Disease Spike
    if w['rainfall_mm'] > 80:
        dengue += random.randint(20, 50)
        cholera += random.randint(5, 15)

    # Demo Mode Overrides
    if is_demo:
        # Check if date is in the last 7 days
        date_obj = datetime.strptime(w['date'], '%Y-%m-%d')
        days_ago = (datetime.now() - date_obj).days
        
        if dist_name == "Ludhiana" and days_ago <= 7:
            dengue += 80  # High Spike
            opd += 200
        elif dist_name == "Patiala":
            dengue += 25  # Medium Risk
            
    hospital_load = round(min(0.95, 0.4 + (opd/1000) + (random.random() * 0.1)), 2)
    
    return {
        "opd_cases": opd,
        "dengue_cases": dengue,
        "malaria_cases": malaria,
        "cholera_cases": cholera,
        "hospital_load": hospital_load
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--demo', action='store_true', help='Generate spiked data for demo')
    args = parser.parse_args()

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Get districts from DB
    cursor.execute("SELECT id, name, lat, long FROM districts")
    districts = cursor.fetchall()

    # 2. Fetch Weather
    weather_results = fetch_weather_for_districts(districts)

    # 3. Combine and Insert
    rows_inserted = 0
    for w in weather_results:
        # Find the district name for the logic
        d_name = next(d[1] for d in districts if d[0] == w['district_id'])
        health = generate_health_logic(w, d_name, args.demo)
        
        cursor.execute("""
            INSERT OR REPLACE INTO daily_stats 
            (district_id, date, opd_cases, dengue_cases, malaria_cases, cholera_cases, 
             rainfall_mm, temp_max_c, temp_min_c, humidity_pct, hospital_load)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w['district_id'], w['date'], health['opd_cases'], health['dengue_cases'],
            health['malaria_cases'], health['cholera_cases'], w['rainfall_mm'],
            w['temp_max_c'], w['temp_min_c'], w['humidity_pct'], health['hospital_load']
        ))
        rows_inserted += 1

    conn.commit()
    conn.close()
    print(f"✅ Successfully loaded {rows_inserted} rows into daily_stats.")

if __name__ == "__main__":
    main()