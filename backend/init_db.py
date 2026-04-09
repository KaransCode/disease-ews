import sqlite3
import os
import pandas as pd

# 1. Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")
CSV_PATH = os.path.join(BASE_DIR, "raw", "districts.csv")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")

def init_database():
    print(f"🚀 Initializing database at: {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 2. Create tables from schema.sql
    with open(SCHEMA_PATH, 'r') as f:
        cur.executescript(f.read())

    # 3. Load data from CSV
    if os.path.exists(CSV_PATH):
        df = pd.read_csv(CSV_PATH)
        # Convert the dataframe to a list of tuples
        district_data = list(df[['id', 'name', 'latitude', 'longitude', 'population']].itertuples(index=False, name=None))
        
        # 4. Insert into DB
        cur.executemany(
            "INSERT OR REPLACE INTO districts (id, name, latitude, longitude, population) VALUES (?, ?, ?, ?, ?)",
            district_data
        )
        print(f"✅ Database ready – {len(district_data)} districts seeded")
    else:
        print(f"❌ Error: Could not find {CSV_PATH}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_database()