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
    activate their account. Uses the same Gmail SMTP setup as the
    password-reset email sender.
    """
    sender_email = os.getenv("SENDER_MAIL")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")

    # Frontend page that will call the verify-email API with this token
    frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    verify_link = f"{frontend_base_url}/verify-email?token={token}"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = "Verify Your Blue Horizon Account"

    body = (
        f"Dear {username},\n\n"
        f"Please verify your email address by clicking the link below:\n"
        f"{verify_link}\n\n"
        f"This link will expire in {TOKEN_EXPIRY_HOURS} hours.\n"
        f"If you did not create this account, please ignore this email."
    )
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"Verification email sent to {email}")
    except Exception as e:
        print(f"CRITICAL ERROR in verification email sending: {e}")