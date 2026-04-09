"""
backend/app.py  — Phase 5 (updated)
Flask application entry point.
Registers all blueprints and starts the APScheduler background pipeline.
"""

import logging
from flask import Flask, jsonify
from flask_cors import CORS

# from utils.db import init_db
from utils.db import get_db
from routes.districts import districts_bp
from routes.scoring import scoring_bp
from routes.alerts_route import alerts_bp
from scheduler import start_scheduler

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    app = Flask(__name__)

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Allow React dev server (Vite default: 5173) and production origin
    CORS(
        app,
        resources={r"/api/*": {"origins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]}},
    )

    # ── Database ──────────────────────────────────────────────────────────────
    # init_db()

    # ── Blueprints ────────────────────────────────────────────────────────────
    app.register_blueprint(districts_bp)
    app.register_blueprint(scoring_bp)
    app.register_blueprint(alerts_bp)

    # ── Health check (Phase 1, kept) ──────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "Disease Outbreak Early Warning System"}), 200

    # ── 404 / 500 JSON handlers ───────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Route not found", "detail": str(e)}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error", "detail": str(e)}), 500

    # ── Scheduler ─────────────────────────────────────────────────────────────
    # Only start once (guard against Flask debug reloader double-start)
    import os
    if os.environ.get("WERKZEUG_RUN_MAIN") != "false":
        start_scheduler()

    logger.info("App ready. Blueprints: districts, scoring, alerts. Scheduler: started.")
    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
