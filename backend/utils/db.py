"""
utils/db.py — SQLite connection helper
"""
import sqlite3
import os


# Get the project root directory (parent of backend/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.getenv("DB_PATH", os.path.join(BASE_DIR, "backend", "database.db"))

# Ensure the database file exists
if not os.path.exists(DB_PATH):
    print(f"⚠️  Database not found at {DB_PATH}, initializing...")
    from init_db import init_database
    init_database()


def get_db():
    """Return a sqlite3 connection with row_factory for dict-like rows."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row   # rows behave like dicts: row["name"]
    conn.execute("PRAGMA journal_mode=WAL")   # better concurrency
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

# ALIAS: This allows ingest.py to find 'get_db_connection' 
get_db_connection = get_db

def query(sql, params=()):
    """Run a SELECT and return list of dicts."""
    conn = get_db()
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def execute(sql, params=()):
    """Run INSERT / UPDATE / DELETE."""
    conn = get_db()
    cur  = conn.execute(sql, params)
    conn.commit()
    last_id = cur.lastrowid
    conn.close()
    return last_id