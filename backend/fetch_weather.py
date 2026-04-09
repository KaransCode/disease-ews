import requests
from datetime import datetime, timedelta
import time

def fetch_weather_for_districts(districts):
    """
    districts: List of tuples/dicts [(id, name, lat, lng), ...]
    Returns list of dicts for daily_stats
    """
    weather_data = []
    base_url = "https://api.open-meteo.com/v1/forecast"
    
    for d_id, name, lat, lng in districts:
        params = {
            "latitude": lat,
            "longitude": lng,
            "daily": ["precipitation_sum", "temperature_2m_max", "temperature_2m_min", "relative_humidity_2m_max"],
            "timezone": "auto",
            "past_days": 30,
            "forecast_days": 0
        }
        
        try:
            print(f"Fetching weather for {name}...")
            response = requests.get(base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()["daily"]
            
            # Open-Meteo returns lists; we need to zip them into daily rows
            for i in range(len(data["time"])):
                weather_data.append({
                    "district_id": d_id,
                    "date": data["time"][i],
                    "rainfall_mm": data["precipitation_sum"][i] or 0.0,
                    "temp_max_c": data["temperature_2m_max"][i],
                    "temp_min_c": data["temperature_2m_min"][i],
                    "humidity_pct": data["relative_humidity_2m_max"][i] or 50.0
                })
            
            # Small sleep to be a good API citizen
            time.sleep(0.1) 
            
        except Exception as e:
            print(f"❌ Error fetching for {name}: {e}")
            continue
            
    return weather_data