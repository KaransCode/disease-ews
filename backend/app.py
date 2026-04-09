"""
app.py — Flask application entry point
Run: python backend/app.py
"""
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow React frontend on localhost:3000

app.config["DB_PATH"] = os.getenv("DB_PATH", "backend/database.db")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Welcome to the Disease Outbreak EWS API. Go to /api/health to check status."
    }), 200

# ── Health check ─────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "project": "Disease Outbreak EWS", "team": "Team Rocket", "team_members":"Karan, Arpit, Vishal, Tanya", "version":"v1.0"})


# ── Register route blueprints (added in Phase 5) ─────────────
# from routes.districts  import districts_bp
# from routes.scoring    import scoring_bp
# from routes.alerts     import alerts_bp
# app.register_blueprint(districts_bp)
# app.register_blueprint(scoring_bp)
# app.register_blueprint(alerts_bp)


if __name__ == "__main__":
    print("🚀 Disease Outbreak EWS — Backend starting...")
    print("📡 API available at: http://localhost:5000")
    app.run(debug=True, port=5000)
