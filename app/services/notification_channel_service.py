"""Envoi des notifications sur des canaux externes (email, SMS, WhatsApp).

Chaque canal est optionnel et no-op tant qu'il n'est pas configuré (voir app/core/config.py) —
aucune dépendance externe n'est sollicitée si les variables d'environnement correspondantes
sont absentes. Les envois sont best-effort : une erreur (SMTP down, Twilio en erreur, ...) est
loggée mais ne doit jamais faire échouer l'action métier à l'origine de la notification.
"""

import asyncio
import logging
import smtplib
from email.mime.text import MIMEText

import httpx

from app.core.config import get_settings
from app.models.system_log import SystemLogLevel
from app.services import system_log_service

logger = logging.getLogger("dtransfert.notifications")

_TWILIO_API_BASE = "https://api.twilio.com/2010-04-01"


def email_channel_configured() -> bool:
    settings = get_settings()
    return bool(settings.smtp_host and settings.smtp_from_email)


def sms_channel_configured() -> bool:
    settings = get_settings()
    return bool(settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_sms_from)


def whatsapp_channel_configured() -> bool:
    settings = get_settings()
    return bool(
        settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_whatsapp_from
    )


def _send_email_sync(
    host: str,
    port: int,
    username: str | None,
    password: str | None,
    use_tls: bool,
    from_email: str,
    to_email: str,
    subject: str,
    body: str,
) -> None:
    message = MIMEText(body, "plain", "utf-8")
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to_email
    with smtplib.SMTP(host, port, timeout=10) as server:
        if use_tls:
            server.starttls()
        if username and password:
            server.login(username, password)
        server.sendmail(from_email, [to_email], message.as_string())


async def send_email(to_email: str, subject: str, body: str) -> None:
    if not email_channel_configured():
        return
    settings = get_settings()
    try:
        await asyncio.to_thread(
            _send_email_sync,
            settings.smtp_host,
            settings.smtp_port,
            settings.smtp_username,
            settings.smtp_password,
            settings.smtp_use_tls,
            settings.smtp_from_email,
            to_email,
            subject,
            body,
        )
    except Exception:
        logger.exception("Échec d'envoi d'email à %s", to_email)
        await system_log_service.log_standalone(
            SystemLogLevel.WARNING, "notifications.email", f"Échec d'envoi d'email à {to_email}"
        )


async def _send_via_twilio(from_number: str, to_number: str, body: str) -> None:
    settings = get_settings()
    url = f"{_TWILIO_API_BASE}/Accounts/{settings.twilio_account_sid}/Messages.json"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            url,
            data={"From": from_number, "To": to_number, "Body": body},
            auth=(settings.twilio_account_sid, settings.twilio_auth_token),
        )
        response.raise_for_status()


async def send_sms(to_phone: str, body: str) -> None:
    if not sms_channel_configured():
        return
    settings = get_settings()
    try:
        await _send_via_twilio(settings.twilio_sms_from, to_phone, body)
    except Exception:
        logger.exception("Échec d'envoi de SMS à %s", to_phone)
        await system_log_service.log_standalone(
            SystemLogLevel.WARNING, "notifications.sms", f"Échec d'envoi de SMS à {to_phone}"
        )


async def send_whatsapp(to_phone: str, body: str) -> None:
    if not whatsapp_channel_configured():
        return
    settings = get_settings()
    try:
        await _send_via_twilio(f"whatsapp:{settings.twilio_whatsapp_from}", f"whatsapp:{to_phone}", body)
    except Exception:
        logger.exception("Échec d'envoi de WhatsApp à %s", to_phone)
        await system_log_service.log_standalone(
            SystemLogLevel.WARNING, "notifications.whatsapp", f"Échec d'envoi de WhatsApp à {to_phone}"
        )


async def dispatch(to_email: str | None, to_phone: str | None, subject: str, body: str) -> None:
    """Envoie sur tous les canaux configurés et applicables au destinataire (best-effort,
    chaque canal est indépendant : l'échec de l'un n'empêche pas les autres)."""
    jobs = []
    if to_email:
        jobs.append(send_email(to_email, subject, body))
    if to_phone:
        jobs.append(send_sms(to_phone, body))
        jobs.append(send_whatsapp(to_phone, body))
    if jobs:
        await asyncio.gather(*jobs)
