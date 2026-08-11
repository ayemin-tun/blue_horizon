# app/utils/booking_email.py
"""
Sends a booking-confirmation email to the agent after a ticket is issued.
Uses the same Gmail SMTP credentials as the other email utilities.
"""
import os
import smtplib
import threading
import io
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import qrcode
from dotenv import load_dotenv

load_dotenv()


def _send_in_background(msg, sender_email: str, sender_password: str, recipient: str):
    """Fire-and-forget SMTP send so the booking response isn't delayed."""
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"[BookingEmail] Confirmation sent to {recipient}")
    except Exception as e:
        print(f"[BookingEmail] CRITICAL ERROR sending to {recipient}: {e}")


def send_booking_confirmation_email(
    agent_email: str,
    agent_name: str,
    ticket_code: str,
    booking_date: str,
    seat_class: str,
    total_price: float,
    flight_no: str,
    airline_name: str,
    departure_city: str,
    arrival_city: str,
    flight_date: str,
    departure_time: str,
    arrival_time: str,
    passengers: list[dict],
):
    """
    Build and send an HTML booking-confirmation email.

    Parameters
    ----------
    passengers : list of dicts, each with keys
        ``name``, ``nrc``, ``dob``, ``gender``, ``phone``, ``seat``
    """
    sender_email = os.getenv("SENDER_MAIL")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")

    if not sender_email or not sender_password:
        print("[BookingEmail] SENDER_MAIL or GMAIL_APP_PASSWORD not set – skipping.")
        return

    # ── build passenger rows ──────────────────────────────────────────
    passenger_rows = ""
    for idx, p in enumerate(passengers, start=1):
        passenger_rows += f"""
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">{idx}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">{p.get('name','—')}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">{p.get('nrc','—')}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">{p.get('gender','—')}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">{p.get('phone','—')}</td>
        </tr>"""

    # ── HTML body ─────────────────────────────────────────────────────
    html = f"""\
    <html>
    <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f6fb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:30px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#2b2ea3,#1b6ddb);padding:28px 32px;">
                <h1 style="margin:0;color:#fff;font-size:22px;">✈️ Booking Confirmed</h1>
                <p style="margin:6px 0 0;color:#d0d8ff;font-size:14px;">Blue Horizon — Ticket Issued Successfully</p>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:24px 32px 8px;">
                <p style="margin:0;font-size:15px;color:#333;">
                  Dear <strong>{agent_name}</strong>,
                </p>
                <p style="margin:8px 0 0;font-size:14px;color:#555;">
                  A new ticket has been issued under your account. Please find the details below.
                </p>
              </td>
            </tr>

            <!-- Ticket & Flight Info -->
            <tr>
              <td style="padding:16px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="background:#f8f9fc;border-radius:6px;padding:16px;">
                  <tr>
                    <td style="padding:6px 12px;font-size:13px;color:#888;">Ticket Code</td>
                    <td style="padding:6px 12px;font-size:15px;font-weight:700;color:#2b2ea3;">{ticket_code}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 12px;font-size:13px;color:#888;">Airline / Flight</td>
                    <td style="padding:6px 12px;font-size:14px;color:#333;">{airline_name} — {flight_no}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 12px;font-size:13px;color:#888;">Route</td>
                    <td style="padding:6px 12px;font-size:14px;color:#333;">{departure_city} → {arrival_city}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 12px;font-size:13px;color:#888;">Date</td>
                    <td style="padding:6px 12px;font-size:14px;color:#333;">{flight_date}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 12px;font-size:13px;color:#888;">Time</td>
                    <td style="padding:6px 12px;font-size:14px;color:#333;">{departure_time} — {arrival_time}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 12px;font-size:13px;color:#888;">Seat Class</td>
                    <td style="padding:6px 12px;font-size:14px;color:#333;">{seat_class}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 12px;font-size:13px;color:#888;">Booking Date</td>
                    <td style="padding:6px 12px;font-size:14px;color:#333;">{booking_date}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 12px;font-size:13px;color:#888;">Total Price</td>
                    <td style="padding:6px 12px;font-size:16px;font-weight:700;color:#27ae60;">
                      {total_price:,.0f} MMK
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- QR Code Section -->
            <tr>
              <td align="center" style="padding:0 32px 16px;">
                <table cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.05);display:inline-block;">
                  <tr>
                    <td align="center">
                      <img src="cid:qrcode" width="130" height="130" alt="Booking QR Code" style="display:block;margin:0 auto;border:none;" />
                      <span style="font-size:10px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-top:8px;font-family:Arial,sans-serif;">Scan to Verify Ticket</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Passengers -->
            <tr>
              <td style="padding:8px 32px 4px;">
                <h3 style="margin:0 0 8px;font-size:15px;color:#333;">👥 Passenger(s)</h3>
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="font-size:13px;color:#333;border-collapse:collapse;">
                  <thead>
                    <tr style="background:#eef0f7;">
                      <th style="padding:8px 12px;text-align:left;">#</th>
                      <th style="padding:8px 12px;text-align:left;">Name</th>
                      <th style="padding:8px 12px;text-align:left;">NRC</th>
                      <th style="padding:8px 12px;text-align:left;">Gender</th>
                      <th style="padding:8px 12px;text-align:left;">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passenger_rows}
                  </tbody>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #eee;margin-top:16px;">
                <p style="margin:0;font-size:12px;color:#999;text-align:center;">
                  This is an automated message from <strong>Blue Horizon</strong>. Please do not reply.
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """

    # Top-level is related (allows inline resources like images)
    msg = MIMEMultipart("related")
    msg["From"] = sender_email
    msg["To"] = agent_email
    msg["Subject"] = f"Booking Confirmed — {ticket_code} | {departure_city} → {arrival_city}"

    # Alternatives container (plain text vs html)
    msg_alt = MIMEMultipart("alternative")
    msg.attach(msg_alt)

    # Plain-text fallback
    plain = (
        f"Booking Confirmed!\n\n"
        f"Ticket: {ticket_code}\n"
        f"Flight: {airline_name} {flight_no}\n"
        f"Route:  {departure_city} → {arrival_city}\n"
        f"Date:   {flight_date}  {departure_time}–{arrival_time}\n"
        f"Class:  {seat_class}\n"
        f"Price:  {total_price:,.0f} MMK\n\n"
        f"Passengers: {', '.join(p.get('name','—') for p in passengers)}\n\n"
        f"— Blue Horizon"
    )
    msg_alt.attach(MIMEText(plain, "plain"))
    msg_alt.attach(MIMEText(html, "html"))

    # Generate QR Code and attach as related part
    try:
        passenger_names = ", ".join(p.get("name", "—") for p in passengers)
        qr_payload = (
            f"🎫 BLUE HORIZON AIRWAYS — AGENT BOOKING\n"
            f"-----------------------------------------\n"
            f"Ticket Code: {ticket_code}\n"
            f"Flight: {flight_no or 'BH-FLIGHT'} ({departure_city} -> {arrival_city})\n"
            f"Date: {flight_date} | Time: {departure_time or 'N/A'}\n"
            f"Class: {(seat_class or 'Economy').upper()}\n"
            f"Passengers: {passenger_names}\n"
            f"Status: CONFIRMED"
        )

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_payload)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")

        qr_io = io.BytesIO()
        qr_img.save(qr_io, format="PNG")

        msg_img = MIMEImage(qr_io.getvalue(), name="qrcode.png")
        msg_img.add_header("Content-ID", "<qrcode>")
        msg_img.add_header("Content-Disposition", "inline", filename="qrcode.png")
        msg.attach(msg_img)
    except Exception as qr_err:
        print(f"[BookingEmail] Error generating/attaching QR code: {qr_err}")

    # Send on a background thread so the API response returns instantly
    thread = threading.Thread(
        target=_send_in_background,
        args=(msg, sender_email, sender_password, agent_email),
        daemon=True,
    )
    thread.start()
