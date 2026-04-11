# 🚀 Commands to Run the Disease EWS Project

## 📋 **Quick Start (Recommended)**

### **Option 1: Use the Automated Script (Easiest)**

```powershell
# From the project root directory
.\start-all.ps1
```

This script will:
- ✅ Check if backend is already running
- ✅ Start backend if needed (port 5000)
- ✅ Check if frontend is already running  
- ✅ Start frontend if needed (port 3000)
- ✅ Wait for both services to be ready
- ✅ Open browser automatically

---

## 🔧 **Option 2: Manual Start (Two Terminals)**

If you prefer more control or the script doesn't work, use this method:

### **Terminal 1 - Backend (Flask)**

```powershell
# Navigate to backend directory
cd "c:\Projects\CodeVista Team Rocket\disease-ews\backend"

# Install Python dependencies (first time only)
pip install -r requirements.txt

# Start the backend server
python app.py
```

**Expected Output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

**The backend will:**
- Start on port 5000
- Serve API endpoints
- Connect to SQLite database
- Enable CORS for frontend

---

### **Terminal 2 - Frontend (React)**

Open a **NEW terminal** (keep backend running in Terminal 1):

```powershell
# Navigate to frontend directory
cd "c:\Projects\CodeVista Team Rocket\disease-ews\frontend"

# Install dependencies (first time only or after package.json changes)
npm install

# Start the development server
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view my-dashboard in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

**The frontend will:**
- Start on port 3000
- Open browser automatically
- Enable hot reloading
- Connect to backend API

---

## 🌐 **Access the Application**

Once both servers are running:

### **Frontend (Main App):**
```
http://localhost:3000
```

### **Backend API:**
```
http://localhost:5000
```

### **API Health Check:**
```
http://localhost:5000/api/health
```

### **API Endpoints:**
```
http://localhost:5000/api/districts              # All districts
http://localhost:5000/api/districts/18/stats     # Rupnagar stats
http://localhost:5000/api/scoring/summary        # Dashboard summary
http://localhost:5000/api/districts/stats/aggregate  # Aggregate stats
```

---

## 🔍 **Verify Everything is Working**

### **1. Check Backend:**

Open browser and visit:
```
http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Disease EWS API is running"
}
```

### **2. Check Frontend:**

Open browser and visit:
```
http://localhost:3000
```

**Expected:**
- Login page or dashboard loads
- No console errors (F12)
- District data displays

### **3. Check Integration:**

Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/api/districts')
  .then(r => r.json())
  .then(data => console.log('Districts loaded:', data.length))
  .catch(err => console.error('Error:', err));
```

**Expected Output:**
```
Districts loaded: 22
```

---

## 🧪 **Run ML Scoring (Generate Fresh Predictions)**

### **Via UI:**
1. Login to the dashboard
2. Click "🔄 Run ML Scoring" button
3. Wait for completion message

### **Via API:**
```powershell
# Using PowerShell
curl -X POST http://localhost:5000/api/scoring/run

# Using browser
# Visit: http://localhost:5000/api/scoring/run
```

### **Via Python:**
```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews\backend"
python -c "import requests; r = requests.post('http://localhost:5000/api/scoring/run'); print(r.json())"
```

---

## 🛑 **Stop the Servers**

### **If started with script:**
- Close the terminal windows that opened

### **If started manually:**
- Go to each terminal
- Press `Ctrl + C`

### **Kill all Node/Python processes (if needed):**
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Kill all Python processes
taskkill /F /IM python.exe

# Or kill specific ports
netstat -ano | findstr :3000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📦 **First-Time Setup**

If you just cloned the repository:

### **1. Install Backend Dependencies:**
```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews\backend"
pip install -r requirements.txt
```

### **2. Install Frontend Dependencies:**
```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews\frontend"
npm install
```

### **3. Setup Environment Variables:**
```powershell
# Copy example env file
cd "c:\Projects\CodeVista Team Rocket\disease-ews"
Copy-Item .env.example .env

# Edit .env with your credentials
notepad .env
```

### **4. Initialize Database:**
```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews\backend"
python init_db.py
```

### **5. Ingest Sample Data:**
```powershell
python ingest.py
```

### **6. Train ML Model (optional):**
```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews\ml_model"
python train.py
```

### **7. Start the App:**
```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews"
.\start-all.ps1
```

---

## 🔄 **After Pulling Latest Changes**

If you just ran `git pull`:

```powershell
# 1. Check if package.json changed
cd "c:\Projects\CodeVista Team Rocket\disease-ews\frontend"

# 2. If yes, reinstall dependencies
npm install

# 3. Restart frontend
# (Ctrl+C in frontend terminal, then npm start)

# 4. Backend usually doesn't need reinstall
# Just restart if you changed Python files
```

---

## 🐛 **Troubleshooting**

### **Backend won't start:**

```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process using port 5000
taskkill /PID <PID> /F

# Check Python version (need 3.8+)
python --version

# Reinstall dependencies
cd backend
pip install -r requirements.txt

# Run directly to see errors
python app.py
```

### **Frontend won't start:**

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process using port 3000
taskkill /PID <PID> /F

# Clear cache and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Start with verbose logging
npm start --verbose
```

### **Frontend can't connect to backend:**

```powershell
# 1. Check backend is running
curl http://localhost:5000/api/health

# 2. Check CORS settings in backend/app.py
# Should have: CORS(app, resources={r"/api/*": {"origins": "*"}})

# 3. Check browser console for errors
# Press F12 → Console tab

# 4. Verify API base URL in frontend/src/services/api.js
# Should be: http://localhost:5000/api
```

### **District Comparison shows no data:**

```powershell
# 1. Check if database has data
cd backend
python check_db.py

# 2. Check API endpoint
curl http://localhost:5000/api/districts/18/stats

# 3. Check browser console for errors
# Look for: "District: ..., Stats: {...}"

# 4. Verify API service is being used
# frontend/src/components/DistrictComparison.jsx should import:
# import api from '../services/api';
```

---

## 📊 **Useful Commands**

### **Check what's running:**
```powershell
# List all listening ports
netstat -ano | findstr "LISTENING"

# Check specific ports
netstat -ano | findstr ":3000 :5000"
```

### **Test API endpoints:**
```powershell
# Get all districts
curl http://localhost:5000/api/districts

# Get Rupnagar stats
curl http://localhost:5000/api/districts/18/stats

# Get summary
curl http://localhost:5000/api/scoring/summary

# Run ML scoring
curl -X POST http://localhost:5000/api/scoring/run
```

### **Check database:**
```powershell
cd backend
python check_db.py
```

### **View logs:**
```powershell
# Backend logs appear in the terminal where you ran python app.py
# Frontend logs appear in:
#   - Terminal where you ran npm start
#   - Browser console (F12)
```

---

## 🎯 **Quick Reference Card**

```
┌─────────────────────────────────────────────────────────┐
│  Disease EWS - Quick Commands                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  START EVERYTHING:                                      │
│    .\start-all.ps1                                      │
│                                                         │
│  START BACKEND ONLY:                                    │
│    cd backend                                           │
│    python app.py                                        │
│                                                         │
│  START FRONTEND ONLY:                                   │
│    cd frontend                                          │
│    npm start                                            │
│                                                         │
│  ACCESS APP:                                            │
│    http://localhost:3000                                │
│                                                         │
│  CHECK BACKEND:                                         │
│    http://localhost:5000/api/health                     │
│                                                         │
│  RUN ML SCORING:                                        │
│    Click "🔄 Run ML Scoring" in UI                      │
│    OR                                                   │
│    curl -X POST http://localhost:5000/api/scoring/run   │
│                                                         │
│  STOP SERVERS:                                          │
│    Ctrl+C in each terminal                              │
│                                                         │
│  AFTER GIT PULL:                                        │
│    cd frontend                                          │
│    npm install                                          │
│    (restart servers)                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📞 **Need Help?**

### **Check these files:**
- `STARTUP_GUIDE.md` - Detailed startup instructions
- `INTEGRATION_COMPLETE.md` - System integration details
- `ALERT_SETUP_GUIDE.md` - Email/SMS alert configuration
- `HOW_TO_CHECK_DENGUE_CASES.md` - Database verification

### **Run diagnostics:**
```powershell
.\test-integration.ps1
```

### **Check documentation:**
All MD files in the project root contain troubleshooting guides.

---

**That's it! Your Disease Early Warning System is ready to run!** 🚀

Start with `.\start-all.ps1` and you'll be up and running in seconds!
