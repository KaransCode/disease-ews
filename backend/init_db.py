"""
init_db.py — Run once to create and seed the database.
Usage: python backend/init_db.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

# All 22 districts of Punjab with coordinates + population
DISTRICTS = [
    ("Amritsar",       2490656, 2683, 31.6340, 74.8723),
    ("Barnala",         596294,  1422, 30.3766, 75.5472),
    ("Bathinda",       1388525, 3385, 30.2110, 74.9455),
    ("Faridkot",        617508,  1469, 30.6742, 74.7565),
    ("Fatehgarh Sahib", 599814,  1180, 30.6485, 76.3896),
    ("Fazilka",         979278,  3121, 30.4012, 74.0229),
    ("Ferozepur",      2026831, 5305, 30.9353, 74.6149),
    ("Gurdaspur",      2299026, 3572, 32.0408, 75.4063),
    ("Hoshiarpur",     1582793, 3386, 31.5143, 75.9115),
    ("Jalandhar",      2193590, 2632, 31.3260, 75.5762),
    ("Kapurthala",      817668,  1633, 31.3811, 75.3814),
    ("Ludhiana",       3498739, 3767, 30.9010, 75.8573),
    ("Malerkotla",      437379,   390, 30.5302, 75.8799),
    ("Mansa",           768808,  2171, 29.9902, 75.3961),
    ("Moga",           1015801,  2230, 30.8171, 75.1707),
    ("Muktsar",         902702,  2615, 30.4741, 74.5157),
    ("Nawanshahr",      614362,  1267, 31.1262, 76.1161),
    ("Pathankot",       688524,  1147, 32.2748, 75.6526),
    ("Patiala",        1892282, 3218, 30.3398, 76.3869),
    ("Rupnagar",        686952,  1418, 30.9650, 76.5264),
    ("Sangrur",        1654408, 3619, 30.2455, 75.8473),
    ("Tarn Taran",     1120070, 2449, 31.4519, 74.9279),
]

def init_database():
    print(f"Initialising database at: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    # Apply schema
    with open(SCHEMA_PATH, "r") as f:
        cur.executescript(f.read())

    # Seed districts (skip if already exists)
    cur.executemany(
        """INSERT OR IGNORE INTO districts (name, population, area_km2, lat, lng)
           VALUES (?, ?, ?, ?, ?)""",
        DISTRICTS,
    )

    conn.commit()

    # Verify
    count = cur.execute("SELECT COUNT(*) FROM districts").fetchone()[0]
    print(f"✅ Database ready — {count} districts seeded")
    conn.close()

if __name__ == "__main__":
    init_database()
