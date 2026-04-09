"""
backend/alerts.py
Alert engine: sends SMS via Twilio and email via Gmail SMTP.
Supports DRY RUN mode when real credentials are not configured.
"""

import os
import smtplib
import logging
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from utils.db import get_db

load_dotenv()
logger = logging.getLogger(__name__)

# ── Twilio credentials ────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "your_account_sid")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "your_auth_token")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "+10000000000")
ALERT_PHONE_NUMBERS = os.getenv("ALERT_PHONE_NUMBERS", "")  # comma-separated

# ── Gmail / SMTP credentials ──────────────────────────────────────────────────
GMAIL_USER = os.getenv("GMAIL_USER", "")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")
ALERT_EMAIL_RECIPIENTS = os.getenv("ALERT_EMAIL_RECIPIENTS", "")  # comma-separated

# ── Threshold ─────────────────────────────────────────────────────────────────
RISK_SCORE_THRESHOLD = float(os.getenv("RISK_SCORE_THRESHOLD", "75"))


def _is_dry_run() -> bool:
    """Returns True if credentials look like placeholders → safe demo mode."""
    return TWILIO_ACCOUNT_SID.startswith("your_") or not TWILIO_ACCOUNT_SID


def _send_sms(district_name: str, score: float, message: str) -> dict:
    """Sends one SMS via Twilio. Returns {success, detail}."""
    phone_numbers = [p.strip() for p in ALERT_PHONE_NUMBERS.split(",") if p.strip()]
    if not phone_numbers:
        return {"success": False, "detail": "ALERT_PHONE_NUMBERS not configured"}

    try:
        from twilio.rest import Client  # lazy import — won't crash if not installed

        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        sent_to = []
        for number in phone_numbers:
            client.messages.create(
                body=message,
                from_=TWILIO_FROM_NUMBER,
                to=number,
            )
            sent_to.append(number)
        return {"success": True, "detail": f"SMS sent to {', '.join(sent_to)}"}
    except ImportError:
        return {
            "success": False,
            "detail": "twilio package not installed. Run: pip install twilio",
        }
    except Exception as e:
        return {"success": False, "detail": str(e)}


def _send_email(district_name: str, score: float, message: str) -> dict:
    """Sends alert email via Gmail SMTP. Returns {success, detail}."""
    recipients = [r.strip() for r in ALERT_EMAIL_RECIPIENTS.split(",") if r.strip()]
    if not recipients:
        return {"success": False, "detail": "ALERT_EMAIL_RECIPIENTS not configured"}
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        return {"success": False, "detail": "Gmail credentials not configured in .env"}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🚨 Disease Outbreak Alert — {district_name} (Score: {score:.1f})"
        msg["From"] = GMAIL_USER
        msg["To"] = ", ".join(recipients)

        html_body = f"""
        <html><body style="font-family: Arial, sans-serif; color: #333;">
          <div style="background:#dc2626;padding:16px;border-radius:8px;color:#fff;">
            <h2 style="margin:0">🚨 HIGH RISK ALERT</h2>
          </div>
          <div style="padding:20px;">
            <p><strong>District:</strong> {district_name}</p>
            <p><strong>Risk Score:</strong> {score:.1f} / 100</p>
            <p><strong>Message:</strong> {message}</p>
            <p><strong>Generated at:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</p>
            <hr/>
            <p style="color:#888;font-size:12px;">
              Disease Outbreak Early Warning System — CODEVISTA v1.0 / Team Rocket, CU
            </p>
          </div>
        </body></html>
        """
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, recipients, msg.as_string())

        return {"success": True, "detail": f"Email sent to {', '.join(recipients)}"}
    except Exception as e:
        return {"success": False, "detail": str(e)}


def _log_alert_to_db(
    district_id: int,
    alert_type: str,
    recipient: str,
    message: str,
    score: float,
    status: str,
) -> None:
    """Inserts one row into the alerts table."""
    db = get_db()
    db.execute(
        """
        INSERT INTO alerts
            (district_id, sent_at, alert_type, recipient, message, risk_score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            district_id,
            datetime.utcnow().isoformat(),
            alert_type,
            recipient,
            message,
            score,
            status,
        ),
    )
    db.commit()


def check_and_send_alerts(district_scores: list[dict]) -> dict:
    """
    Main alert function called after scoring.

    Args:
        district_scores: list of dicts with keys:
            district_id, district_name, score, risk_level

    Returns:
        {"sent": N, "failed": N, "skipped": N}
    """
    sent = failed = skipped = 0
    dry_run = _is_dry_run()

    if dry_run:
        logger.warning(
            "[ALERTS] DRY RUN MODE — Twilio credentials look like placeholders. "
            "No real SMS/email will be sent. Set real credentials in .env to enable."
        )

    for district in district_scores:
        score = district.get("score", 0)
        district_id = district.get("district_id")
        district_name = district.get("district_name", "Unknown")

        if score < RISK_SCORE_THRESHOLD:
            skipped += 1
            continue

        alert_message = (
            f"HIGH RISK ALERT: {district_name} has a disease outbreak risk score of "
            f"{score:.1f}/100. Immediate public health response recommended."
        )

        if dry_run:
            # ── DRY RUN: log only, no real sends ─────────────────────────────
            logger.info(
                f"[DRY RUN] Would alert for {district_name} (score={score:.1f}): "
                f"{alert_message}"
            )
            _log_alert_to_db(
                district_id=district_id,
                alert_type="DRY_RUN",
                recipient="dry-run@localhost",
                message=alert_message,
                score=score,
                status="DRY_RUN",
            )
            sent += 1
            continue

        # ── REAL SENDS ────────────────────────────────────────────────────────
        # SMS
        sms_result = _send_sms(district_name, score, alert_message)
        sms_status = "SENT" if sms_result["success"] else "FAILED"
        _log_alert_to_db(
            district_id=district_id,
            alert_type="SMS",
            recipient=ALERT_PHONE_NUMBERS,
            message=alert_message,
            score=score,
            status=sms_status,
        )
        if sms_result["success"]:
            sent += 1
            logger.info(f"[SMS] {district_name}: {sms_result['detail']}")
        else:
            failed += 1
            logger.error(f"[SMS FAILED] {district_name}: {sms_result['detail']}")

        # Email
        email_result = _send_email(district_name, score, alert_message)
        email_status = "SENT" if email_result["success"] else "FAILED"
        _log_alert_to_db(
            district_id=district_id,
            alert_type="EMAIL",
            recipient=ALERT_EMAIL_RECIPIENTS,
            message=alert_message,
            score=score,
            status=email_status,
        )
        if email_result["success"]:
            sent += 1
            logger.info(f"[EMAIL] {district_name}: {email_result['detail']}")
        else:
            failed += 1
            logger.error(f"[EMAIL FAILED] {district_name}: {email_result['detail']}")

    summary = {"sent": sent, "failed": failed, "skipped": skipped, "dry_run": dry_run}
    logger.info(f"[ALERTS] Summary: {summary}")
    return summary
