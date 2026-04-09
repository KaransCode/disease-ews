# INTEGRATION.md — How to Merge Everyone's Work
### Read this on Integration Day (6–8 hrs before your presentation)

---

## WHO DOES THE INTEGRATION?
**Karan** does the merge on his laptop. Everyone else is on standby to fix issues.

---

## STEP 1 — Everyone pushes their final code (30 min)

Each person runs this on their laptop:
```bash
cd disease-ews
git add .
git commit -m "FINAL — Phase X complete — [your name]"
git push origin main
```

**Wait until all 4 people have pushed before continuing.**

---

## STEP 2 — Karan pulls everything (10 min)

```bash
cd disease-ews
git pull origin main
```

If there are merge conflicts, Claude can fix them. Paste the conflict into Claude with:
> "I have a merge conflict in [filename]. Here is the content: [paste]. Help me resolve it keeping both people's changes."

---

## STEP 3 — Verify folder structure (5 min)

Run this and make sure all files exist:
```bash
ls backend/
# Should show: app.py, init_db.py, schema.sql, fetch_weather.py,
#              ingest.py, alerts.py, scheduler.py, requirements.txt

ls backend/routes/
# Should show: __init__.py, districts.py, scoring.py, alerts_route.py

ls ml_model/
# Should show: process.py, train.py, predict.py, model.pkl

ls data/raw/
# Should show: health_records.csv, districts.csv

ls frontend/src/components/
# Should show: MapDashboard.js, DistrictPanel.js, StatCards.js, AlertBanner.js
```

---

## STEP 4 — Uncomment blueprints in app.py (5 min)

Open `backend/app.py` and uncomment these lines (Vishal's routes):
```python
from routes.districts   import districts_bp
from routes.scoring     import scoring_bp
from routes.alerts      import alerts_bp
app.register_blueprint(districts_bp)
app.register_blueprint(scoring_bp)
app.register_blueprint(alerts_bp)
```

---

## STEP 5 — Load demo data (10 min)

```bash
# Reset database with fresh demo data
python backend/init_db.py
python backend/ingest.py --demo
python ml_model/process.py
python ml_model/predict.py
```

Expected output:
```
✅ Database ready — 22 districts seeded
✅ Demo data loaded — 660 rows inserted (22 districts × 30 days)
✅ Features engineered — 660 rows processed
✅ Risk scores generated — 22 districts scored for today
   Ludhiana   → 82  HIGH
   Patiala    → 77  HIGH
   Amritsar   → 61  MEDIUM
```

---

## STEP 6 — Start the backend (5 min)

```bash
source venv/bin/activate
python backend/app.py
```

Test these URLs in browser — all must return JSON:
- `http://localhost:5000/api/health`
- `http://localhost:5000/api/districts`
- `http://localhost:5000/api/districts/12/scores`  ← Ludhiana (id=12)
- `http://localhost:5000/api/alerts`

---

## STEP 7 — Start the frontend (5 min)

Open a NEW terminal tab:
```bash
cd frontend
npm install   # only if node_modules missing
npm start
```

Open `http://localhost:3000` in browser.

---

## STEP 8 — End-to-end test checklist

Work through this list with your whole team watching:

```
□ Map loads and shows Punjab outline
□ Districts are colored (green / amber / red)
□ Ludhiana shows RED (score 82)
□ Clicking Ludhiana opens side panel
□ Side panel shows: score 82, HIGH RISK, Dengue Fever
□ Side panel shows 14-day trend chart going up
□ Stat cards at top show: 22 monitored, 2–3 high risk, alerts count
□ "Simulate Outbreak" button changes Ludhiana progressively 30→82
□ Alert banner appears at top when HIGH risk detected
□ No red errors in browser console (F12 → Console tab)
□ No errors in Flask terminal
```

---

## COMMON INTEGRATION ERRORS & FIXES

### Error: "CORS error" in browser console
**Fix:** Make sure `CORS(app)` is in `backend/app.py` and frontend is calling `http://localhost:5000` (not https)

### Error: "Module not found: routes.districts"
**Fix:** Make sure `backend/routes/__init__.py` exists (even if empty) and you're running Flask from the `disease-ews/` root folder, not from inside `backend/`

### Error: "model.pkl not found"
**Fix:** Karan runs `python ml_model/train.py` on the integration laptop to regenerate the model

### Error: "no such table: risk_scores"
**Fix:** Run `python backend/init_db.py` again — the database needs to be recreated on this laptop

### Error: React map doesn't show Punjab shape
**Fix:** Make sure Tanya's `MapDashboard.js` is loading the GeoJSON file correctly. The file should be at `frontend/public/punjab-districts.geojson`

### Error: "Cannot connect to http://localhost:5000"
**Fix:** Flask backend is not running. Open a separate terminal and run `python backend/app.py`
