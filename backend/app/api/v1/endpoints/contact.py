"""
Contact form endpoint.
"""

from __future__ import annotations

import logging
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

    Stores the message in the DB and sends email notifications via the
    canonical email_service (Resend).  No auth required.
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

    # Send email notifications via canonical email service
    try:
        from app.services.email_service import send_contact_acknowledgement, send_contact_forward
        send_contact_acknowledgement(str(payload.email), payload.name)
        send_contact_forward(payload.name, str(payload.email), "Contact Form", payload.message)
    except Exception as exc:
        logger.warning("Failed to send contact emails: %s", exc)

    logger.info("Contact form submitted by %s <%s>", payload.name, payload.email)
    return {"ok": True}
