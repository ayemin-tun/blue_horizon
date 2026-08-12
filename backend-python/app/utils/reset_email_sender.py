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

    if not sender_email or not sender_password:
        print("[ResetEmail] SENDER_MAIL or GMAIL_APP_PASSWORD not set – skipping.")
        return

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
              🔑 Password Reset
            </h1>
            <p style="margin:10px 0 0;color:#bfdbfe;font-size:13px;">
              Your account password has been reset by an administrator
            </p>
          </td>
        </tr>

        <!-- Security badge -->
        <tr>
          <td style="padding:0 40px;">
            <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;
                        padding:12px 18px;margin:24px 0 0;display:flex;align-items:center;">
              <p style="margin:0;font-size:13px;color:#92400e;">
                ⚠️ &nbsp;<strong>Security Notice:</strong> This email contains a temporary password.
                Do not share it with anyone.
              </p>
            </div>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:24px 40px 8px;">
            <p style="margin:0;font-size:15px;color:#1e293b;">
              Hello, <strong style="color:#1e3a8a;">{username}</strong>
            </p>
            <p style="margin:10px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
              An administrator has reset your <strong>Blue Horizon</strong> account password.
              Use the temporary password below to log in, then change your password immediately
              from your profile page.
            </p>
          </td>
        </tr>

        <!-- Temp Password pill -->
        <tr>
          <td style="padding:20px 40px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:1.5px;
                       text-transform:uppercase;color:#64748b;">Your Temporary Password</p>
            <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;
                        padding:18px 24px;text-align:center;">
              <span style="font-family:'Courier New',Courier,monospace;font-size:24px;
                           font-weight:700;letter-spacing:4px;color:#1e3a8a;">
                {temp_password}
              </span>
            </div>
          </td>
        </tr>

        <!-- Steps -->
        <tr>
          <td style="padding:4px 40px 24px;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#374151;">
              Next steps:
            </p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:6px 0;">
                  <span style="display:inline-block;width:22px;height:22px;border-radius:50%;
                               background:#1e3a8a;color:#fff;font-size:11px;font-weight:700;
                               text-align:center;line-height:22px;margin-right:10px;">1</span>
                  <span style="font-size:13px;color:#374151;">Go to <strong>Blue Horizon</strong> and click <strong>Login</strong></span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="display:inline-block;width:22px;height:22px;border-radius:50%;
                               background:#1e3a8a;color:#fff;font-size:11px;font-weight:700;
                               text-align:center;line-height:22px;margin-right:10px;">2</span>
                  <span style="font-size:13px;color:#374151;">Enter your email and the temporary password above</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="display:inline-block;width:22px;height:22px;border-radius:50%;
                               background:#1e3a8a;color:#fff;font-size:11px;font-weight:700;
                               text-align:center;line-height:22px;margin-right:10px;">3</span>
                  <span style="font-size:13px;color:#374151;">Navigate to <strong>Edit Profile → Change Password</strong> and set a new password</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;"></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              If you did not request this reset, please contact your system administrator immediately.<br>
              This is an automated message from <strong style="color:#1e3a8a;">Blue Horizon</strong>. Do not reply.
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
        f"Hello {username},\n\n"
        f"Your Blue Horizon account password has been reset by an administrator.\n\n"
        f"Temporary Password: {temp_password}\n\n"
        f"Please log in and change your password immediately from Edit Profile > Change Password.\n\n"
        f"If you did not request this, please contact your system administrator.\n\n"
        f"— Blue Horizon"
    )

    msg = MIMEMultipart("alternative")
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = "🔑 Blue Horizon — Your Password Has Been Reset"
    msg.attach(MIMEText(plain, 'plain'))
    msg.attach(MIMEText(html, 'html'))

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"[ResetEmail] Temp password email sent to {email}")
    except Exception as e:
        print(f"[ResetEmail] CRITICAL ERROR sending to {email}: {e}")