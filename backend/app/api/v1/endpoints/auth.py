"""
Auth endpoints — Clerk webhook receiver.

The `/users/me` route (in users.py) handles the authenticated "get me"
request.  This router handles only unauthenticated Clerk webhook events.
"""

from __future__ import annotations

import json
import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session
from svix.webhooks import Webhook, WebhookVerificationError  # type: ignore

from app.core.config import settings
from app.db.base import get_db
from app.models.user import PlanType
from app.models.user import User as UserModel

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Clerk webhook — with Svix signature verification
# ---------------------------------------------------------------------------

def _verify_svix_signature(
    raw_body: bytes,
    svix_id: str | None,
    svix_timestamp: str | None,
    svix_signature: str | None,
    webhook_secret: str,
) -> bool:
    """
    Verify the Svix webhook signature sent by Clerk.
    Returns True if valid, False otherwise.
    Logs a warning on verification failure for easier debugging.
    """
    try:
        wh = Webhook(webhook_secret)
        headers: dict[str, str] = {}
        if svix_id:
            headers["svix-id"] = svix_id
        if svix_timestamp:
            headers["svix-timestamp"] = svix_timestamp
        if svix_signature:
            headers["svix-signature"] = svix_signature
        wh.verify(raw_body, headers)
        return True
    except WebhookVerificationError as exc:
        logger.warning("Clerk webhook signature verification failed: %s", exc)
        return False
    except Exception:
        logger.exception("Unexpected error verifying Clerk webhook signature")
        return False


@router.post("/webhook/clerk", status_code=status.HTTP_200_OK)
async def clerk_webhook(
    request: Request,
    db: Session = Depends(get_db),
    svix_id: str | None = Header(default=None, alias="svix-id"),
    svix_timestamp: str | None = Header(default=None, alias="svix-timestamp"),
    svix_signature: str | None = Header(default=None, alias="svix-signature"),
) -> dict:
    """
    Handle Clerk webhook events (user.created / user.updated / user.deleted).

    Signature verification is performed when CLERK_WEBHOOK_SECRET is set.
    In demo/dev mode (secret not configured) the signature check is skipped
    so local testing still works without a live Clerk account.
    """
    raw_body = await request.body()

    if settings.CLERK_WEBHOOK_SECRET:
        valid = _verify_svix_signature(
            raw_body, svix_id, svix_timestamp, svix_signature,
            settings.CLERK_WEBHOOK_SECRET,
        )
        if not valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature",
            )

    try:
        payload = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = payload.get("type")

    if event_type == "user.created":
        user_data = payload.get("data", {})
        user_id = user_data.get("id")
        email_list = user_data.get("email_addresses", [])
        email = email_list[0].get("email_address") if email_list else None
        name = (
            f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
            or None
        )

        existing = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not existing:
            user = UserModel(
                id=user_id,
                email=email,
                name=name,
                plan=PlanType.FREE,
            )
            db.add(user)
            try:
                db.commit()
            except Exception:
                db.rollback()
                logger.exception("Failed to create user %s from webhook", user_id)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to persist new user",
                )

        return {"status": "success"}

    elif event_type == "user.updated":
        user_data = payload.get("data", {})
        user_id = user_data.get("id")

        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if user:
            email_list = user_data.get("email_addresses", [])
            email = email_list[0].get("email_address") if email_list else None
            name = (
                f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
                or user.name
            )
            if email:
                user.email = email
            user.name = name
            try:
                db.commit()
            except Exception:
                db.rollback()
                logger.exception("Failed to update user %s from webhook", user_id)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to persist user update",
                )

        return {"status": "success"}

    elif event_type == "user.deleted":
        user_id = payload.get("data", {}).get("id")

        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if user:
            try:
                db.delete(user)
                db.commit()
            except Exception:
                db.rollback()
                logger.exception("Failed to delete user %s from webhook", user_id)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to delete user",
                )

        return {"status": "success"}

    return {"status": "ignored"}
