# app/utils/email_verification_utils.py
import os
import secrets
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.database import models

load_dotenv()

TOKEN_EXPIRY_HOURS = 24


def generate_verification_token(db: Session, user_id: int) -> str:
    """
    Creates a new email verification token for the given user and stores it
    in the EMAIL_VERIFICATION_TOKENS table with a 24-hour expiry.
    Any previous unused tokens for this user are invalidated first.
    """
    # Invalidate old unused tokens for this user so only the latest link works
    db.query(models.EmailVerificationToken).filter(
        models.EmailVerificationToken.user_id == user_id,
        models.EmailVerificationToken.is_used == 0
    ).update({"is_used": 1})

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=TOKEN_EXPIRY_HOURS)

    new_token = models.EmailVerificationToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at,
        is_used=0
    )
    db.add(new_token)
    db.flush()  # so the token row exists before we send the email

    return token


def send_verification_email(email: str, username: str, token: str):
    """
    Sends a verification email containing a link the user must click to
    activate their account.
    """
    sender_email = os.getenv("SENDER_MAIL")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")

    if not sender_email or not sender_password:
        print("[VerificationEmail] SENDER_MAIL or GMAIL_APP_PASSWORD not set – skipping.")
        return

    # Frontend page that will call the verify-email API with this token
    frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    verify_link = f"{frontend_base_url}/verify-email?token={token}"

    html = f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,Helvetica,sans-serif;background:#f0f2f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.10);max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1d4ed8 100%);
                     padding:36px 40px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;letter-spacing:3px;text-transform:uppercase;
                       color:#93c5fd;font-weight:600;">Blue Horizon</p>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
              ✉️ Verify Your Email
            </h1>
            <p style="margin:10px 0 0;color:#bfdbfe;font-size:13px;">
              Please verify your email address to activate your account
            </p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 12px;">
            <p style="margin:0;font-size:15px;color:#1e293b;">
              Welcome, <strong style="color:#1e3a8a;">{username}</strong>!
            </p>
            <p style="margin:12px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
              Thank you for registering with <strong>Blue Horizon</strong>. To complete your account setup and access all agent features, please verify your email address.
            </p>
          </td>
        </tr>

        <!-- Action Button -->
        <tr>
          <td style="padding:20px 40px 28px;text-align:center;">
            <a href="{verify_link}" target="_blank"
               style="display:inline-block;background:linear-gradient(135deg,#1e3a8a,#2563eb);
                      color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;
                      padding:14px 36px;border-radius:10px;box-shadow:0 4px 12px rgba(37,99,235,0.3);">
              Verify Email Address
            </a>
            <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">
              This link will expire in <strong>{TOKEN_EXPIRY_HOURS} hours</strong>.
            </p>
          </td>
        </tr>

        <!-- Link Box fallback -->
        <tr>
          <td style="padding:0 40px 24px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;word-break:break-all;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                Button not working? Copy and paste this link into your browser:
              </p>
              <a href="{verify_link}" style="font-size:12px;color:#2563eb;text-decoration:underline;">
                {verify_link}
              </a>
            </div>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;"></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              If you did not create an account with Blue Horizon, you can safely ignore this email.<br>
              This is an automated message. Do not reply to this email.
            </p>
            <p style="margin:12px 0 0;font-size:11px;color:#cbd5e1;">
              © 2026 Blue Horizon. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    plain = (
        f"Dear {username},\n\n"
        f"Please verify your email address by clicking the link below:\n"
        f"{verify_link}\n\n"
        f"This link will expire in {TOKEN_EXPIRY_HOURS} hours.\n"
        f"If you did not create this account, please ignore this email.\n\n"
        f"— Blue Horizon"
    )

    msg = MIMEMultipart("alternative")
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = "✉️ Verify Your Blue Horizon Account"
    msg.attach(MIMEText(plain, 'plain'))
    msg.attach(MIMEText(html, 'html'))

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"[VerificationEmail] Sent to {email}")
    except Exception as e:
        print(f"[VerificationEmail] CRITICAL ERROR sending to {email}: {e}")