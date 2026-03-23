"""
Contact form endpoint.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)
router = APIRouter()


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


@router.post("")
async def submit_contact(
    request: Request,
    payload: ContactRequest,
) -> dict[str, Any]:
    """
    Accept a contact form submission.

    Stores the message in the DB (if available) and optionally forwards to
    CONTACT_EMAIL via a configured email service.  No auth required.
    """
    # Persist to DB
    try:
        from app.db.session import SessionLocal
        from app.models.contact import ContactMessage
        db = SessionLocal()
        try:
            msg = ContactMessage(
                name=payload.name[:200],
                email=str(payload.email)[:254],
                message=payload.message[:5000],
            )
            db.add(msg)
            db.commit()
        finally:
            db.close()
    except Exception as exc:
        logger.error("Failed to store contact message in DB: %s", exc)
        # Do not fail the request — continue to email fallback

    # Optional: forward to CONTACT_EMAIL
    contact_email = os.getenv("CONTACT_EMAIL", "")
    if contact_email:
        try:
            import httpx
            from app.core.config import settings
            resend_key = getattr(settings, "RESEND_API_KEY", "")
            if resend_key:
                httpx.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {resend_key}"},
                    json={
                        "from": getattr(settings, "FROM_EMAIL", "noreply@amarktai.com"),
                        "to": [contact_email],
                        "subject": f"Contact Form: {payload.name}",
                        "text": f"From: {payload.name} <{payload.email}>\n\n{payload.message}",
                    },
                    timeout=10,
                )
        except Exception as exc:
            logger.warning("Failed to forward contact email: %s", exc)

    logger.info("Contact form submitted by %s <%s>", payload.name, payload.email)
    return {"ok": True}
    """
    Accept a contact form submission.

    Stores the message in the DB (if available) and optionally forwards to
    CONTACT_EMAIL via a configured email service.  No auth required.
    """
    # Persist to DB
    try:
        from app.db.session import SessionLocal
        from app.models.contact import ContactMessage
        db = SessionLocal()
        try:
            msg = ContactMessage(
                name=payload.name[:200],
                email=str(payload.email)[:254],
                message=payload.message[:5000],
            )
            db.add(msg)
            db.commit()
        finally:
            db.close()
    except Exception as exc:
        logger.error("Failed to store contact message in DB: %s", exc)
        # Do not fail the request — continue to email fallback

    # Optional: forward to CONTACT_EMAIL
    contact_email = os.getenv("CONTACT_EMAIL", "")
    if contact_email:
        try:
            import httpx
            from app.core.config import settings
            resend_key = settings.RESEND_API_KEY if hasattr(settings, "RESEND_API_KEY") else ""
            if resend_key:
                httpx.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {resend_key}"},
                    json={
                        "from": getattr(settings, "FROM_EMAIL", "noreply@amarktai.com"),
                        "to": [contact_email],
                        "subject": f"Contact Form: {payload.name}",
                        "text": f"From: {payload.name} <{payload.email}>\n\n{payload.message}",
                    },
                    timeout=10,
                )
        except Exception as exc:
            logger.warning("Failed to forward contact email: %s", exc)

    logger.info("Contact form submitted by %s <%s>", payload.name, payload.email)
    return {"ok": True}
