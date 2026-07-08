# app/utils/reset_email_sender.py
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_email_notification(email: str, username: str, temp_password: str):
    sender_email = os.getenv("SENDER_MAIL")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")
    
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = "Your Password Has Been Reset"
    
    body = f"Dear {username},\n\nYour temporary password is: {temp_password}\nPlease change it immediately."
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"Email sent to {email}")
    except Exception as e:
        print(f"CRITICAL ERROR in Email sending: {e}")