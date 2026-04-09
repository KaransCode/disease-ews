"""
utils/db.py — SQLite connection helper
Usage: from utils.db import get_db
"""
import sqlite3
import os


DB_PATH = os.getenv("DB_PATH", "backend/database.db")


def get_db():
    """Return a sqlite3 connection with row_factory for dict-like rows."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row   # rows behave like dicts: row["name"]
    conn.execute("PRAGMA journal_mode=WAL")   # better concurrency
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


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
