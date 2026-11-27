import os
import smtplib
from email.message import EmailMessage
from urllib.parse import urlencode
from email.utils import formataddr

from dotenv import load_dotenv

load_dotenv()


def send_verification_email(to_email: str, token: str) -> None:
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_app_password = os.getenv("SMTP_APP_PASSWORD", "").replace(" ", "")
    backend_base_url = os.getenv(
        "BACKEND_BASE_URL",
        "http://127.0.0.1:8000",
    ).rstrip("/")

    if not smtp_user or not smtp_app_password:
        raise RuntimeError("E-posta gönderim ayarları .env dosyasında eksik.")

    query = urlencode({"token": token})
    verification_url = (
        f"{backend_base_url}/api/auth/verify-email?{query}"
    )

    message = EmailMessage()
    message["Subject"] = "Media Space e-posta doğrulaması"
    message["From"] = formataddr(("Media Space", smtp_user))
    message["To"] = to_email
    message.set_content(
        "Merhaba,\n\n"
        "Media Space hesabını doğrulamak için bu bağlantıyı aç:\n"
        f"{verification_url}\n\n"
        "Bağlantı 24 saat geçerlidir. "
        "Bu kaydı sen yapmadıysan bu e-postayı yok sayabilirsin."
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_user, smtp_app_password)
        server.send_message(message)

def send_password_reset_email(to_email: str, token: str) -> None:
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_app_password = os.getenv("SMTP_APP_PASSWORD", "").replace(" ", "")
    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    ).rstrip("/")

    if not smtp_user or not smtp_app_password:
        raise RuntimeError("E-posta gönderim ayarları .env dosyasında eksik.")

    query = urlencode({"token": token})
    reset_url = f"{frontend_url}/#reset-password?{query}"

    message = EmailMessage()
    message["Subject"] = "Media Space şifre sıfırlama"
    message["From"] = formataddr(("Media Space", smtp_user))
    message["To"] = to_email
    message.set_content(
        "Merhaba,\n\n"
        "Media Space hesabının şifresini yenilemek için bu bağlantıyı aç:\n"
        f"{reset_url}\n\n"
        "Bağlantı 30 dakika geçerlidir. "
        "Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin."
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_user, smtp_app_password)
        server.send_message(message)