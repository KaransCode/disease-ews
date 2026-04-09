"""
backend/routes/alerts_route.py
Blueprint for alert history and simulation routes.
"""

from datetime import datetime
from flask import Blueprint, jsonify
from utils.db import get_db

alerts_bp = Blueprint("alerts", __name__, url_prefix="/api")


@alerts_bp.route("/alerts", methods=["GET"])
def get_alerts():
    """
    GET /api/alerts
    Returns the last 10 alerts with district name.
    """
    db = get_db()
    try:
        rows = db.execute(
            """
            SELECT
                a.id,
                d.name          AS district_name,
                a.sent_at,
                a.risk_score,
                a.alert_type,
                a.status,
                r.risk_level
            FROM alerts a
            JOIN districts d ON d.id = a.district_id
            LEFT JOIN risk_scores r
                ON r.district_id = a.district_id
               AND DATE(r.date) = DATE(a.sent_at)
            ORDER BY a.sent_at DESC
            LIMIT 10
            """,
        ).fetchall()

        result = [
            {
                "id": row["id"],
                "district_name": row["district_name"],
                "sent_at": row["sent_at"],
                "risk_score": row["risk_score"],
                "risk_level": row["risk_level"] or "HIGH",
                "alert_type": row["alert_type"],
                "status": row["status"],
            }
            for row in rows
        ]
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@alerts_bp.route("/alerts/simulate", methods=["GET"])
def simulate_alert():
    """
    GET /api/alerts/simulate
    Demo endpoint — inserts a fake HIGH alert for Ludhiana and returns it.
    Safe for judges: no real SMS/email is sent.
    """
    db = get_db()
    try:
        # Find Ludhiana district id
        ludhiana = db.execute(
            "SELECT id, name FROM districts WHERE name LIKE '%Ludhiana%' LIMIT 1"
        ).fetchone()

        if not ludhiana:
            # Fallback: pick any district
            ludhiana = db.execute("SELECT id, name FROM districts LIMIT 1").fetchone()

        if not ludhiana:
            return jsonify({"error": "No districts found in database"}), 404

        now = datetime.utcnow().isoformat()
        fake_score = 87.5

        db.execute(
            """
            INSERT INTO alerts
                (district_id, sent_at, alert_type, recipient, message, risk_score, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                ludhiana["id"],
                now,
                "SIMULATED",
                "demo@codevista.in",
                f"[DEMO] HIGH RISK detected in {ludhiana['name']}. "
                f"Risk score: {fake_score}. Immediate attention required.",
                fake_score,
                "SIMULATED",
            ),
        )
        db.commit()

        # Fetch the record we just inserted
        new_alert = db.execute(
            "SELECT * FROM alerts WHERE district_id = ? ORDER BY id DESC LIMIT 1",
            (ludhiana["id"],),
        ).fetchone()

        return jsonify({
            "id": new_alert["id"],
            "district_name": ludhiana["name"],
            "sent_at": new_alert["sent_at"],
            "risk_score": new_alert["risk_score"],
            "risk_level": "HIGH",
            "alert_type": new_alert["alert_type"],
            "status": new_alert["status"],
            "message": new_alert["message"],
            "note": "This is a simulated alert for demo purposes. No real SMS/email was sent.",
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
