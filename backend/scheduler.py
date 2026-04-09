"""
backend/scheduler.py
APScheduler-based pipeline: runs daily at 06:00.
Also exposes run_pipeline() for manual Flask triggers.
"""

import subprocess
import sys
import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

_scheduler = BackgroundScheduler(timezone="Asia/Kolkata")


def _run_script(script_path: str) -> bool:
    """Runs a Python script. Returns True on success."""
    logger.info(f"[SCHEDULER] Running: {script_path}")
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            timeout=300,
        )
        if result.returncode != 0:
            logger.error(
                f"[SCHEDULER] {script_path} failed:\n{result.stderr or result.stdout}"
            )
            return False
        logger.info(f"[SCHEDULER] {script_path} completed OK.")
        return True
    except subprocess.TimeoutExpired:
        logger.error(f"[SCHEDULER] {script_path} timed out (300 s)")
        return False
    except Exception as e:
        logger.error(f"[SCHEDULER] {script_path} error: {e}")
        return False


def run_pipeline():
    """
    Full pipeline:
      1. Ingest fresh data   (backend/ingest.py)
      2. ML prediction       (ml_model/predict.py)
      3. Send alerts         (alerts.check_and_send_alerts)

    Returns a summary dict so Flask can expose it via /api/run-scoring too.
    """
    started_at = datetime.utcnow().isoformat() + "Z"
    logger.info(f"[PIPELINE] Starting at {started_at}")

    # Step 1 — Ingest
    ingest_ok = _run_script("backend/ingest.py")

    # Step 2 — Predict
    predict_ok = _run_script("ml_model/predict.py")

    # Step 3 — Alerts
    alert_result = {"error": "skipped — prediction failed"}
    if predict_ok:
        try:
            from utils.db import get_db
            from alerts import check_and_send_alerts
            from datetime import date

            today = date.today().isoformat()
            db = get_db()
            rows = db.execute(
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
                for row in rows
            ]
            alert_result = check_and_send_alerts(district_scores)
        except Exception as e:
            logger.error(f"[PIPELINE] Alert step error: {e}")
            alert_result = {"error": str(e)}

    summary = {
        "started_at": started_at,
        "finished_at": datetime.utcnow().isoformat() + "Z",
        "ingest_ok": ingest_ok,
        "predict_ok": predict_ok,
        "alerts": alert_result,
    }
    logger.info(f"[PIPELINE] Done: {summary}")
    return summary


def start_scheduler():
    """Registers the daily cron job and starts the background scheduler."""
    if _scheduler.running:
        logger.info("[SCHEDULER] Already running — skipping start.")
        return

    _scheduler.add_job(
        func=run_pipeline,
        trigger=CronTrigger(hour=6, minute=0),   # 06:00 IST every day
        id="daily_pipeline",
        name="Daily Disease Outbreak Pipeline",
        replace_existing=True,
        misfire_grace_time=600,  # allow 10-minute late start
    )

    _scheduler.start()
    logger.info("[SCHEDULER] Started. Pipeline scheduled daily at 06:00 IST.")


def stop_scheduler():
    """Graceful shutdown (call from app teardown if needed)."""
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("[SCHEDULER] Stopped.")
