# backend/blog/mailer.py
import json
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def send_email_via_gas(to, subject, body, html_body=None, name="Bookfolio"):
    url = getattr(settings, "GAS_EMAIL_URL", None)
    secret = getattr(settings, "GAS_SECRET_KEY", None)

    if not url or not secret:
        logger.error("GAS_EMAIL_URL ou GAS_SECRET_KEY manquant dans settings.py")
        return False

    payload = {
        "secret": secret,
        "to": to,
        "subject": subject,
        "body": body,
        "name": name,
    }
    if html_body:
        payload["htmlBody"] = html_body

    try:
        response = requests.post(
            url,
            data=json.dumps(payload),
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "success":
            logger.info(f"✅ Email envoyé à {to}")
            return True
        logger.error(f"❌ Erreur GAS : {data.get('message')}")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Erreur réseau GAS : {e}")
        return False