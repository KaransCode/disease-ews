-- Disease Outbreak Early Warning System — Database Schema
-- Run: python backend/init_db.py

-- Districts of Punjab (22 districts)
CREATE TABLE IF NOT EXISTS districts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    population  INTEGER,
    area_km2    REAL,
    lat         REAL,
    lng         REAL
);

-- Daily health + weather stats per district
CREATE TABLE IF NOT EXISTS daily_stats (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id     INTEGER NOT NULL,
    date            TEXT NOT NULL,              -- YYYY-MM-DD
    opd_cases       INTEGER DEFAULT 0,          -- Outpatient cases
    dengue_cases    INTEGER DEFAULT 0,
    malaria_cases   INTEGER DEFAULT 0,
    cholera_cases   INTEGER DEFAULT 0,
    rainfall_mm     REAL DEFAULT 0.0,           -- Daily rainfall
    temp_max_c      REAL DEFAULT 0.0,
    temp_min_c      REAL DEFAULT 0.0,
    humidity_pct    REAL DEFAULT 0.0,
    hospital_load   REAL DEFAULT 0.0,           -- 0.0 to 1.0 (beds occupied %)
    FOREIGN KEY (district_id) REFERENCES districts(id),
    UNIQUE(district_id, date)
);

-- ML model risk scores (updated daily)
CREATE TABLE IF NOT EXISTS risk_scores (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id     INTEGER NOT NULL,
    date            TEXT NOT NULL,              -- YYYY-MM-DD
    score           REAL NOT NULL,              -- 0 to 100
    risk_level      TEXT NOT NULL,              -- LOW / MEDIUM / HIGH
    primary_disease TEXT,                       -- predicted disease type
    confidence      REAL,                       -- model confidence 0-1
    FOREIGN KEY (district_id) REFERENCES districts(id),
    UNIQUE(district_id, date)
);

-- Alerts sent to health authorities
CREATE TABLE IF NOT EXISTS alerts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id     INTEGER NOT NULL,
    sent_at         TEXT NOT NULL,              -- ISO timestamp
    alert_type      TEXT NOT NULL,              -- SMS / EMAIL
    recipient       TEXT NOT NULL,
    message         TEXT NOT NULL,
    risk_score      REAL,
    status          TEXT DEFAULT 'SENT',        -- SENT / FAILED
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_daily_stats_district_date
    ON daily_stats(district_id, date);

CREATE INDEX IF NOT EXISTS idx_risk_scores_district_date
    ON risk_scores(district_id, date);

CREATE INDEX IF NOT EXISTS idx_risk_scores_date
    ON risk_scores(date);
