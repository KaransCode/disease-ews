# 📧📱 Setup Real Email & SMS Alerts

## 🎯 Current Status

Your alert system is **fully functional** but running in **DRY RUN MODE** (demo mode). No real emails or SMS are sent because the credentials in `.env` are placeholders.

---

## 📊 How Alerts Work

### **Alert Flow:**
```
1. ML Scoring runs (manual or scheduled at 6 AM)
   ↓
2. System checks all district risk scores
   ↓
3. If score >= 75 (threshold) → Trigger alerts
   ↓
4. Send SMS via Twilio
   ↓
5. Send Email via Gmail
   ↓
6. Log alert to database
```

### **Current Behavior (DRY RUN):**
```
✅ Alerts are LOGGED to database
❌ No real SMS sent
❌ No real emails sent
📝 Console shows: "[DRY RUN] Would alert for..."
```

---

## 🔧 Option 1: Enable REAL SMS Alerts (Twilio)

### **Step 1: Create Twilio Account**
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free trial account
3. You'll get:
   - Account SID
   - Auth Token
   - Free phone number

### **Step 2: Update .env File**

Open `.env` and replace these lines:

```env
# BEFORE (Current - DRY RUN):
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
ALERT_PHONE_NUMBERS=+91XXXXXXXXXX

# AFTER (Real credentials):
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_real_auth_token_from_twilio
TWILIO_FROM_NUMBER=+1234567890  # Your Twilio phone number
ALERT_PHONE_NUMBERS=+919876543210,+919876543211  # Your phone(s)
```

### **Step 3: Install Twilio Package**

```powershell
cd "c:\Projects\CodeVista Team Rocket\disease-ews\backend"
pip install twilio
```

### **Step 4: Restart Backend**

```powershell
# Stop current backend (Ctrl+C)
python app.py
```

### **Step 5: Test**

Run ML scoring from dashboard. If any district has score >= 75, you'll receive an SMS!

---

## 📧 Option 2: Enable REAL Email Alerts (Gmail)

### **Step 1: Generate Gmail App Password**

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security** from left menu
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App passwords**: https://myaccount.google.com/apppasswords
5. Select **Mail** and your device
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### **Step 2: Update .env File**

```env
# BEFORE (Current - DRY RUN):
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here
ALERT_EMAIL_RECIPIENTS=your_email@gmail.com

# AFTER (Real credentials):
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop  # No spaces!
ALERT_EMAIL_RECIPIENTS=yourname@gmail.com,recipient2@example.com
```

**Important:** Remove spaces from the app password!

### **Step 3: Restart Backend**

```powershell
# Stop current backend (Ctrl+C)
python app.py
```

### **Step 4: Test**

Run ML scoring. If any district has score >= 75, you'll receive an email!

---

## 🎨 Option 3: Keep DRY RUN Mode (For Demo/Testing)

If you don't want to set up real credentials yet, the system works perfectly in demo mode:

### **What Works:**
- ✅ Alerts are logged to database
- ✅ You can view alert history in UI
- ✅ Console shows what WOULD be sent
- ✅ No real SMS/emails sent (safe for testing)

### **View Alerts in Dashboard:**
1. Login to app
2. Go to Analytics Dashboard
3. See alert ticker at top
4. All dry-run alerts are stored and visible

---

## 📊 Current Alert Configuration

### **Threshold Settings:**

In `.env`:
```env
RISK_SCORE_THRESHOLD=75
```

**Meaning:** Alerts are sent when district risk score >= 75

### **Current Districts That Would Trigger Alerts:**

Based on today's data:
- ✅ **Rupnagar**: 94.9 (HIGH) → **Would trigger alert**
- ❌ Amritsar: 66.0 (MEDIUM) → Below threshold
- ❌ Others: All below 75

---

## 🔍 Test Your Alert Setup

### **Test 1: Check Current Mode**

Run this in backend:
```powershell
cd backend
python -c "from alerts import _is_dry_run; print('DRY RUN' if _is_dry_run() else 'LIVE MODE')"
```

### **Test 2: Trigger Test Alert**

```powershell
# Via API
Invoke-RestMethod -Uri "http://localhost:5000/api/alerts/simulate" -Method GET
```

### **Test 3: Run Full Scoring**

From dashboard:
1. Click "⚙️ Run ML Scoring"
2. Check backend console for alert messages
3. If LIVE MODE: Check your phone/email

---

## 📱 Sample Alert Messages

### **SMS Message:**
```
HIGH RISK ALERT: Rupnagar has a disease outbreak risk score of 94.9/100. 
Immediate public health response recommended.
```

### **Email Subject:**
```
🚨 Disease Outbreak Alert — Rupnagar (Score: 94.9)
```

### **Email Body:**
```
🚨 HIGH RISK ALERT

District: Rupnagar
Risk Score: 94.9 / 100
Message: HIGH RISK ALERT: Rupnagar has a disease outbreak risk score of 94.9/100...
Generated at: 2026-04-11 10:30 UTC

Disease Outbreak Early Warning System — CODEVISTA v1.0 / Team Rocket, CU
```

---

## 🎯 Quick Setup Checklist

### **For SMS Alerts:**
- [ ] Create Twilio account
- [ ] Get Account SID and Auth Token
- [ ] Update `.env` with real credentials
- [ ] Add your phone number to `ALERT_PHONE_NUMBERS`
- [ ] Install twilio package: `pip install twilio`
- [ ] Restart backend
- [ ] Test with ML scoring

### **For Email Alerts:**
- [ ] Enable 2-Step Verification on Gmail
- [ ] Generate App Password
- [ ] Update `.env` with real credentials
- [ ] Add recipient emails to `ALERT_EMAIL_RECIPIENTS`
- [ ] Restart backend
- [ ] Test with ML scoring

### **For Both:**
- [ ] Set `RISK_SCORE_THRESHOLD=75` (or your preferred threshold)
- [ ] Run ML scoring
- [ ] Verify alerts received

---

## 🔒 Security Best Practices

1. **NEVER commit `.env` to Git** (already in `.gitignore`)
2. **Use App Passwords** for Gmail (not your regular password)
3. **Rotate credentials** periodically
4. **Limit phone numbers** to essential recipients only
5. **Monitor alert logs** in database for unauthorized usage

---

## 💡 Pro Tips

### **Multiple Recipients:**
```env
ALERT_PHONE_NUMBERS=+919876543210,+919876543211,+919876543212
ALERT_EMAIL_RECIPIENTS=admin@health.gov.in,cmo@health.gov.in
```

### **Adjust Threshold:**
```env
# More sensitive (more alerts)
RISK_SCORE_THRESHOLD=60

# Less sensitive (fewer alerts)
RISK_SCORE_THRESHOLD=85
```

### **Check Alert History:**
```sql
-- In SQLite
SELECT * FROM alerts ORDER BY sent_at DESC LIMIT 10;
```

---

## 🚀 Summary

| Mode | SMS | Email | Database Log | Use Case |
|------|-----|-------|--------------|----------|
| **DRY RUN** (Current) | ❌ | ❌ | ✅ | Testing, Demo |
| **LIVE** | ✅ | ✅ | ✅ | Production |

**To switch from DRY RUN to LIVE:**
1. Get real Twilio credentials (for SMS)
2. Generate Gmail App Password (for Email)
3. Update `.env` file
4. Restart backend
5. Done! 🎉

---

## 📞 Need Help?

- **Twilio Support:** https://support.twilio.com/
- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833
- **Check Backend Logs:** Look for `[ALERTS]` messages in console

**Your alert system is ready to go! Just add real credentials and you'll receive notifications!** 📧📱
