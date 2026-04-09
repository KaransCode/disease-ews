"""
backend/routes/scoring.py
Blueprint for ML scoring pipeline routes.
"""

import subprocess
import sys
import os
from datetime import date, datetime
from flask import Blueprint, jsonify, current_app
from utils.db import get_db

scoring_bp = Blueprint("scoring", __name__, url_prefix="/api")


def _run_subprocess(script_path: str) -> tuple[bool, str]:
    """Helper: runs a Python script via subprocess. Returns (success, output/error)."""
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            timeout=120,  # 2-minute timeout
        )
        if result.returncode != 0:
            return False, result.stderr.strip() or result.stdout.strip()
        return True, result.stdout.strip()
    except subprocess.TimeoutExpired:
        return False, f"Subprocess timed out after 120 s: {script_path}"
    except FileNotFoundError:
        return False, f"Script not found: {script_path}"
    except Exception as e:
        return False, str(e)


@scoring_bp.route("/run-scoring", methods=["POST"])
def run_scoring():
    """
    POST /api/run-scoring
    Triggers the full ML pipeline then auto-runs alert checker.
    """
    model_path = os.path.join("ml_model", "model.pkl")
    predict_script = os.path.join("ml_model", "predict.py")

    # Guard: model must exist before we can predict
    if not os.path.exists(model_path):
        return jsonify({
            "status": "error",
            "message": (
                "model.pkl not found at ml_model/model.pkl. "
                "Ask Karan to run Phase 3/4 first to train and export the model."
            ),
        }), 503

    if not os.path.exists(predict_script):
        return jsonify({
            "status": "error",
            "message": "predict.py not found at ml_model/predict.py.",
        }), 503

    # Run prediction
    ok, output = _run_subprocess(predict_script)
    if not ok:
        return jsonify({"status": "error", "message": output}), 500

    # Count today's scored districts & high-risk count
    db = get_db()
    today = date.today().isoformat()
    try:
        total_row = db.execute(
            "SELECT COUNT(*) AS cnt FROM risk_scores WHERE date = ?", (today,)
        ).fetchone()
        high_row = db.execute(
            "SELECT COUNT(*) AS cnt FROM risk_scores WHERE date = ? AND risk_level = 'HIGH'",
            (today,),
        ).fetchone()
        districts_scored = total_row["cnt"] if total_row else 0
        high_risk_count = high_row["cnt"] if high_row else 0
    except Exception as db_err:
        return jsonify({"status": "error", "message": str(db_err)}), 500

    # Auto-trigger alert checker
    try:
        from alerts import check_and_send_alerts

        scored_rows = db.execute(
            """
            SELECT r.district_id, d.name AS district_name, r.score, r.risk_level
            FROM risk_scores r
            JOIN districts d ON d.id = r.district_id
            WHERE r.date = ?
            """,
            (today,),
        ).fetchall()

        district_scores = [
            {
                "district_id": row["district_id"],
                "district_name": row["district_name"],
                "score": row["score"],
                "risk_level": row["risk_level"],
            }
            for row in scored_rows
        ]
        alert_result = check_and_send_alerts(district_scores)
    except Exception as alert_err:
        # Non-fatal — scoring succeeded even if alerts fail
        alert_result = {"error": str(alert_err)}

    return jsonify({
        "status": "ok",
        "districts_scored": districts_scored,
        "high_risk_count": high_risk_count,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "alerts": alert_result,
        "ml_output": output[:500] if output else "",  # truncate for safety
    }), 200


@scoring_bp.route("/scoring/summary", methods=["GET"])
def scoring_summary():
    """
    GET /api/scoring/summary
    Dashboard header card stats for today.
    """
    db = get_db()
    today = date.today().isoformat()
    try:
        districts_monitored = db.execute(
            "SELECT COUNT(*) AS cnt FROM districts"
        ).fetchone()["cnt"]

        high_row = db.execute(
            "SELECT COUNT(*) AS cnt FROM risk_scores WHERE date = ? AND risk_level = 'HIGH'",
            (today,),
        ).fetchone()
        medium_row = db.execute(
            "SELECT COUNT(*) AS cnt FROM risk_scores WHERE date = ? AND risk_level = 'MEDIUM'",
            (today,),
        ).fetchone()
        alerts_row = db.execute(
            "SELECT COUNT(*) AS cnt FROM alerts WHERE DATE(sent_at) = ?", (today,)
        ).fetchone()

        # Last time any score was written for today
        last_score_row = db.execute(
            "SELECT MAX(date) AS last_date FROM risk_scores WHERE date = ?", (today,)
        ).fetchone()

        return jsonify({
            "districts_monitored": districts_monitored,
            "high_risk_count": high_row["cnt"] if high_row else 0,
            "medium_risk_count": medium_row["cnt"] if medium_row else 0,
            "alerts_sent_today": alerts_row["cnt"] if alerts_row else 0,
            "last_updated": datetime.utcnow().isoformat() + "Z",
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
