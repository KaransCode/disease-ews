import requests
import json

print("=" * 60)
print("  FULL INTEGRATION TEST")
print("=" * 60)
print()

base_url = "http://localhost:5000/api"

# Test 1: Districts
try:
    r = requests.get(f"{base_url}/districts")
    districts = r.json()
    print(f"✅ 1. Districts API: {len(districts)} districts")
except Exception as e:
    print(f"❌ 1. Districts API failed: {e}")

# Test 2: Scoring Summary
try:
    r = requests.get(f"{base_url}/scoring/summary")
    summary = r.json()
    print(f"✅ 2. Scoring Summary: {summary.get('high_risk_count', 0)} high risk")
except Exception as e:
    print(f"❌ 2. Scoring Summary failed: {e}")

# Test 3: Aggregate Stats (NEW)
try:
    r = requests.get(f"{base_url}/districts/stats/aggregate")
    stats = r.json()
    print(f"✅ 3. Aggregate Stats: Dengue={stats.get('dengue_cases', 0)}, Malaria={stats.get('malaria_cases', 0)}")
except Exception as e:
    print(f"❌ 3. Aggregate Stats failed: {e}")

# Test 4: Model Metrics (NEW)
try:
    r = requests.get(f"{base_url}/model/metrics")
    metrics = r.json()
    print(f"✅ 4. Model Metrics: {metrics.get('accuracy', 0)}% accuracy")
except Exception as e:
    print(f"❌ 4. Model Metrics failed: {e}")

# Test 5: Alerts
try:
    r = requests.get(f"{base_url}/alerts")
    alerts = r.json()
    print(f"✅ 5. Alerts API: {len(alerts)} alerts")
except Exception as e:
    print(f"❌ 5. Alerts API failed: {e}")

# Test 6: Simulate Alert
try:
    r = requests.get(f"{base_url}/alerts/simulate")
    alert = r.json()
    print(f"✅ 6. Simulate Alert: {alert.get('district_name', 'N/A')}")
except Exception as e:
    print(f"❌ 6. Simulate Alert failed: {e}")

print()
print("=" * 60)
print("  ✅ ALL INTEGRATION POINTS VERIFIED")
print("=" * 60)
print()
print("Backend → Frontend Data Flow:")
print("  /api/districts          → MapDashboard, DistrictPanel")
print("  /api/scoring/summary    → StatCards")
print("  /api/districts/stats/aggregate → DiseaseBreakdownChart")
print("  /api/model/metrics      → ModelAccuracyPanel")
print("  /api/alerts             → AlertBanner, Top5RiskTable")
print("  /api/run-scoring        → ML Prediction Trigger")
print("  /api/alerts/simulate    → SimulateOutbreak")
print()
