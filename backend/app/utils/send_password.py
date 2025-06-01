from smtplib import SMTP
from email.message import EmailMessage

from app.core.config import settings


def send_password(email: str, password: str):
    msg = EmailMessage()
    msg["Subject"] = "Hisob yaratildi"
    msg["From"] = settings.EMAIL_HOST_USER
    msg["To"] = email
    msg.set_content(f"Sizning parolingiz: {password}")
    with SMTP(host="smtp.gmail.com", port=587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASS)
        smtp.send_message(msg)