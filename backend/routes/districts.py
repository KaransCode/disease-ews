"""
backend/routes/districts.py
Blueprint for district-related API routes.
"""

from flask import Blueprint, jsonify
from datetime import date, timedelta
from utils.db import get_db

districts_bp = Blueprint("districts", __name__, url_prefix="/api")


@districts_bp.route("/districts", methods=["GET"])
def get_all_districts():
    """
    GET /api/districts
    Returns all 22 districts with today's risk score.
    """
    today = date.today().isoformat()
    db = get_db()
    try:
        rows = db.execute(
            """
            SELECT
                d.id,
                d.name,
                d.population,
                d.lat,
                d.lng,
                COALESCE(r.score, 0)            AS score,
                COALESCE(r.risk_level, 'NO DATA') AS risk_level,
                COALESCE(r.primary_disease, '')   AS primary_disease
            FROM districts d
            LEFT JOIN risk_scores r
                ON r.district_id = d.id
               AND r.date = ?
            ORDER BY d.name
            """,
            (today,),
        ).fetchall()

        result = [
            {
                "id": row["id"],
                "name": row["name"],
                "population": row["population"],
                "lat": row["lat"],
                "lng": row["lng"],
                "score": row["score"],
                "risk_level": row["risk_level"],
                "primary_disease": row["primary_disease"],
            }
            for row in rows
        ]
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@districts_bp.route("/districts/<int:district_id>/scores", methods=["GET"])
def get_district_scores(district_id):
    """
    GET /api/districts/<district_id>/scores
    Returns last 30 days of risk scores for one district.
    """
    db = get_db()
    try:
        district = db.execute(
            "SELECT id, name FROM districts WHERE id = ?", (district_id,)
        ).fetchone()

        if not district:
            return jsonify({"error": f"District {district_id} not found"}), 404

        thirty_days_ago = (date.today() - timedelta(days=30)).isoformat()
        rows = db.execute(
            """
            SELECT date, score, risk_level, primary_disease
            FROM risk_scores
            WHERE district_id = ? AND date >= ?
            ORDER BY date DESC
            """,
            (district_id, thirty_days_ago),
        ).fetchall()

        scores = [
            {
                "date": row["date"],
                "score": row["score"],
                "risk_level": row["risk_level"],
                "primary_disease": row["primary_disease"],
            }
            for row in rows
        ]

        return jsonify(
            {
                "district": {"id": district["id"], "name": district["name"]},
                "scores": scores,
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@districts_bp.route("/districts/<int:district_id>/stats", methods=["GET"])
def get_district_stats(district_id):
    """
    GET /api/districts/<district_id>/stats
    Returns last 14 days of daily_stats for charts.
    """
    db = get_db()
    try:
        district = db.execute(
            "SELECT id, name FROM districts WHERE id = ?", (district_id,)
        ).fetchone()

        if not district:
            return jsonify({"error": f"District {district_id} not found"}), 404

        fourteen_days_ago = (date.today() - timedelta(days=14)).isoformat()
        rows = db.execute(
            """
            SELECT date, opd_cases, dengue_cases, malaria_cases,
                   cholera_cases, rainfall_mm, temp_max_c, hospital_load
            FROM daily_stats
            WHERE district_id = ? AND date >= ?
            ORDER BY date DESC
            """,
            (district_id, fourteen_days_ago),
        ).fetchall()

        stats = [
            {
                "date": row["date"],
                "opd_cases": row["opd_cases"],
                "dengue_cases": row["dengue_cases"],
                "malaria_cases": row["malaria_cases"],
                "cholera_cases": row["cholera_cases"],
                "rainfall_mm": row["rainfall_mm"],
                "temp_max_c": row["temp_max_c"],
                "hospital_load": row["hospital_load"],
            }
            for row in rows
        ]

        return jsonify(
            {
                "district": {"id": district["id"], "name": district["name"]},
                "stats": stats,
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
