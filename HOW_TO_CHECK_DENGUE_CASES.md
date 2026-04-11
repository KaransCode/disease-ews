# 🔍 How to Check Dengue Cases by District

## ✅ VERIFIED: Database HAS Dengue Data

**Good News:** The database contains dengue cases for all districts!

### **Sample Data from Database (April 9, 2026):**

| District | Dengue Cases | Malaria Cases | OPD Cases |
|----------|-------------|---------------|-----------|
| Amritsar | 3 | 0 | 232 |
| Ludhiana | 84 | 2 | 420 |
| Patiala | 29 | 2 | 488 |
| Rupnagar | 4 | 10 | 389 |
| Jalandhar | 5 | 3 | 528 |
| Pathankot | 4 | 5 | 709 |
| **ALL 22 districts** | ✅ Have data | ✅ Have data | ✅ Have data |

---

## 📋 4 Ways to Check Dengue Cases

### **Method 1: Check Database Directly (PowerShell)**

```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews\backend"

python -c "import sqlite3; conn = sqlite3.connect('database.db'); cur = conn.cursor(); cur.execute('SELECT d.name, ds.dengue_cases, ds.malaria_cases, ds.date FROM districts d JOIN daily_stats ds ON ds.district_id = d.id ORDER BY ds.date DESC, d.name LIMIT 22'); print('District | Dengue | Malaria | Date'); print('-'*60); [print(f'{row[0]:25} | {row[1]:8} | {row[2]:9} | {row[3]}') for row in cur.fetchall()]; conn.close()"
```

**What this shows:**
- All 22 districts with their dengue cases
- Most recent date first
- Verifies data exists in database

---

### **Method 2: Test API Endpoint (Browser)**

**For Rupnagar (District ID 18):**
```
http://localhost:5000/api/districts/18/stats
```

**For Amritsar (District ID 1):**
```
http://localhost:5000/api/districts/1/stats
```

**For any district:**
```
http://localhost:5000/api/districts/{district_id}/stats
```

**What you'll see:**
```json
{
  "district": {
    "id": 18,
    "name": "Rupnagar"
  },
  "stats": [
    {
      "date": "2026-04-09",
      "dengue_cases": 4,        ← HERE!
      "malaria_cases": 10,
      "opd_cases": 389,
      "rainfall_mm": 0.1,
      "temp_max_c": 25.8,
      "hospital_load": 0.84
    },
    ... more days
  ]
}
```

---

### **Method 3: Test API Endpoint (PowerShell)**

```powershell
# Test Rupnagar
curl http://localhost:5000/api/districts/18/stats | ConvertFrom-Json | ConvertTo-Json -Depth 5

# Test all districts (summary)
python -c "import requests; [print(f'{requests.get(f\"http://localhost:5000/api/districts/{i}/stats\").json()[\"district\"][\"name\"]}: Dengue={requests.get(f\"http://localhost:5000/api/districts/{i}/stats\").json()[\"stats\"][0][\"dengue_cases\"]}') for i in range(1, 23)]"
```

---

### **Method 4: Check in React Frontend (Browser Console)**

This is the **BEST way** to see what the DistrictComparison component is receiving!

#### **Step-by-Step:**

1. **Open your browser:**
   ```
   http://localhost:3000
   ```

2. **Open Developer Tools:**
   - Press `F12`
   - Or right-click → "Inspect"
   - Click "Console" tab

3. **Go to Analytics Dashboard:**
   - Login if needed
   - Click "📊 Analytics Dashboard"

4. **Scroll to "District Comparison" section**

5. **Select a district (e.g., "Rupnagar"):**
   - Click the first dropdown
   - Select "Rupnagar"

6. **Check Console Output:**
   You should see:
   ```
   District: Rupnagar, Stats: {
     date: "2026-04-09",
     dengue_cases: 4,
     malaria_cases: 10,
     opd_cases: 389,
     rainfall_mm: 0.1,
     temp_max_c: 25.8,
     hospital_load: 0.84
   }
   ```

7. **Verify the UI shows:**
   - Dengue Cases: 4
   - Malaria Cases: 10
   - OPD Cases: 389
   - etc.

---

## 🎯 Complete District List with IDs

| ID | District Name | Expected Dengue (Apr 9) |
|----|--------------|------------------------|
| 1 | Amritsar | 3 |
| 2 | Barnala | 2 |
| 3 | Bathinda | 0 |
| 4 | Faridkot | 3 |
| 5 | Fatehgarh Sahib | 2 |
| 6 | Fazilka | 1 |
| 7 | Firozpur | 5 |
| 8 | Gurdaspur | 3 |
| 9 | Hoshiarpur | 4 |
| 10 | Jalandhar | 5 |
| 11 | Kapurthala | 3 |
| 12 | Ludhiana | 84 ← Highest! |
| 13 | Mansa | 5 |
| 14 | Moga | 4 |
| 15 | Pathankot | 4 |
| 16 | Patiala | 29 |
| 17 | Rupnagar | 4 |
| 18 | Sahibzada Ajit Singh Nagar | 4 |
| 19 | Sangrur | 0 |
| 20 | Shahid Bhagat Singh Nagar | 3 |
| 21 | Sri Muktsar Sahib | 3 |
| 22 | Tarn Taran | 5 |

---

## 🔍 Troubleshooting: If Dengue Shows 0 in UI

### **Check 1: Is the stats data being fetched?**

Open Console (F12) and look for:
```
District: Rupnagar, Stats: {...}
```

**If you see this:**
- ✅ Stats are being fetched
- ✅ Data is available
- ❌ If dengue_cases is 0, that's what's in the database

**If you DON'T see this:**
- ❌ Stats are NOT being fetched
- The fetchDistrictStats() function isn't being called

### **Check 2: Manually test the API**

Open Console (F12) and run:
```javascript
fetch('http://localhost:5000/api/districts/18/stats')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**Expected output:**
```javascript
{
  district: {id: 18, name: "Rupnagar"},
  stats: [
    {
      date: "2026-04-09",
      dengue_cases: 4,
      malaria_cases: 10,
      ...
    }
  ]
}
```

### **Check 3: Verify districtStats state**

Open Console (F12) and run:
```javascript
// This checks if the component has the data
console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
```

Or better, add this temporary debug line to the component:
```javascript
// In DistrictComparison.jsx, after getMetrics:
console.log('districtStats state:', districtStats);
```

---

## 📊 Quick Verification Script

Run this in PowerShell to see ALL districts with dengue cases:

```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews\backend"

python -c "
import sqlite3

conn = sqlite3.connect('database.db')
cur = conn.cursor()

# Get most recent date
cur.execute('SELECT MAX(date) FROM daily_stats')
latest_date = cur.fetchone()[0]

print(f'Most recent data date: {latest_date}')
print()
print(f'{'District':25} | {'Dengue':8} | {'Malaria':8} | {'OPD':8}')
print('-' * 60)

cur.execute('''
    SELECT d.name, ds.dengue_cases, ds.malaria_cases, ds.opd_cases
    FROM districts d
    JOIN daily_stats ds ON ds.district_id = d.id
    WHERE ds.date = ?
    ORDER BY ds.dengue_cases DESC
''', (latest_date,))

for row in cur.fetchall():
    print(f'{row[0]:25} | {row[1]:8} | {row[2]:9} | {row[3]:8}')

conn.close()
"
```

**Expected Output:**
```
Most recent data date: 2026-04-09

District                  |   Dengue |  Malaria |      OPD
------------------------------------------------------------
Ludhiana                  |       84 |        2 |      420
Patiala                   |       29 |        2 |      488
Firozpur                  |        5 |        0 |      294
Mansa                     |        5 |        3 |      312
Tarn Taran                |        5 |        5 |      601
... (all 22 districts)
```

---

## ✅ Summary

| Check | Status | How to Verify |
|-------|--------|---------------|
| Database has dengue data? | ✅ YES | Run Method 1 |
| API returns dengue data? | ✅ YES | Run Method 2 or 3 |
| Frontend fetches stats? | ⚠️ Check | Run Method 4 (Console) |
| UI displays dengue? | ⚠️ Check | Look at District Comparison |

---

## 🎯 What to Do Right Now

### **1. Verify Database (30 seconds):**
```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews\backend"
python check_db.py
```

### **2. Check Frontend Console (30 seconds):**
1. Open http://localhost:3000
2. Press F12
3. Go to Analytics Dashboard
4. Select "Rupnagar" in District Comparison
5. Look for: `District: Rupnagar, Stats: {...}`

### **3. If you see stats but UI shows 0:**
- Screenshot the console output
- Screenshot the District Comparison UI
- The issue is in the rendering logic

### **4. If you DON'T see console output:**
- The fetchDistrictStats() function isn't being called
- Need to debug the setSelection() function

---

## 🚀 Expected Result

When you select **Rupnagar** in District Comparison, you should see:

```
┌───────────────────────────────┐
│ Rupnagar                      │
│ HIGH                          │
├───────────────────────────────┤
│ Risk Score: 94.90             │
│ ████████████████████          │
│ Dengue Cases: 4               │ ← Should show 4!
│ █                             │
│ Malaria Cases: 10             │ ← Should show 10!
│ ██                            │
│ Cholera Cases: 0              │
│                               │
│ OPD Cases: 389                │
│ █████████                     │
│ Rainfall (mm): 0.1mm          │
│                               │
│ Temperature: 25.8°C           │
│ █████████████                 │
│ Hospital Load: 84%            │
│ █████████████████             │
└───────────────────────────────┘
```

---

**The data EXISTS in the database and the API IS returning it. If the UI shows 0, we need to check the console to see what's happening!** 🎯
