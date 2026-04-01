"""
Billing endpoints — Stripe integration for subscription management.

Provides:
- GET  /billing/plans       — list available plans
- POST /billing/checkout    — create a Stripe Checkout session
- POST /billing/portal      — create a Stripe Customer Portal session
- POST /billing/webhook     — Stripe webhook handler
- GET  /billing/status      — current subscription status

All billing state comes from Stripe as the single source of truth.
If STRIPE_SECRET_KEY is not configured, endpoints degrade gracefully.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()


def _stripe_configured() -> bool:
    return bool(settings.STRIPE_SECRET_KEY)


def _get_stripe():
    """Lazy import and configure stripe."""
    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        return stripe
    except ImportError:
        return None


# ── Plan definitions ─────────────────────────────────────────────────────────

PLANS = [
    {
        "id": "free",
        "name": "Free",
        "price": 0,
        "interval": "month",
        "quota": 50,
        "features": ["1 web app", "3 platforms", "50 posts/month", "Basic analytics"],
        "stripe_price_id": None,  # Free plan does not require a Stripe price
    },
    {
        "id": "pro",
        "name": "Pro",
        "price": 29,
        "interval": "month",
        "quota": 500,
        "features": ["5 web apps", "All platforms", "500 posts/month", "Advanced analytics", "AI media generation", "Priority support"],
        "stripe_price_id": settings.STRIPE_PRICE_ID_PRO or None,
    },
    {
        "id": "business",
        "name": "Business",
        "price": 99,
        "interval": "month",
        "quota": 2000,
        "features": ["Unlimited web apps", "All platforms", "2000 posts/month", "Team access", "Custom branding", "API access"],
        "stripe_price_id": settings.STRIPE_PRICE_ID_BUSINESS or None,
    },
    {
        "id": "enterprise",
        "name": "Enterprise",
        "price": 299,
        "interval": "month",
        "quota": 99999,
        "features": ["Everything in Business", "Dedicated support", "Custom integrations", "SLA guarantee"],
        "stripe_price_id": settings.STRIPE_PRICE_ID_ENTERPRISE or None,
    },
]


@router.get("/plans")
async def list_plans() -> dict[str, Any]:
    """List available subscription plans."""
    return {
        "plans": PLANS,
        "stripe_configured": _stripe_configured(),
    }


class CheckoutRequest(BaseModel):
    plan_id: str  # "pro", "business", "enterprise"


@router.post("/checkout")
async def create_checkout_session(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Create a Stripe Checkout session for subscription upgrade."""
    stripe = _get_stripe()
    if not stripe or not _stripe_configured():
        raise HTTPException(
            status_code=503,
            detail="Billing is not configured. Set STRIPE_SECRET_KEY in environment.",
        )

    plan = next((p for p in PLANS if p["id"] == payload.plan_id), None)
    if not plan or not plan.get("stripe_price_id"):
        raise HTTPException(status_code=400, detail=f"Invalid plan: {payload.plan_id}")

    # Ensure user has a Stripe customer ID
    stripe_customer_id = getattr(current_user, "stripe_customer_id", None)
    if not stripe_customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            metadata={"user_id": current_user.id},
        )
        current_user.stripe_customer_id = customer.id
        db.commit()
        stripe_customer_id = customer.id

    session = stripe.checkout.Session.create(
        customer=stripe_customer_id,
        mode="subscription",
        line_items=[{"price": plan["stripe_price_id"], "quantity": 1}],
        success_url=f"{settings.FRONTEND_URL}/dashboard/settings?billing=success",
        cancel_url=f"{settings.FRONTEND_URL}/dashboard/settings?billing=cancelled",
        metadata={"user_id": current_user.id, "plan_id": payload.plan_id},
    )

    return {"checkout_url": session.url, "session_id": session.id}


@router.post("/portal")
async def create_portal_session(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Create a Stripe Customer Portal session for subscription management."""
    stripe = _get_stripe()
    if not stripe or not _stripe_configured():
        raise HTTPException(status_code=503, detail="Billing not configured.")

    stripe_customer_id = getattr(current_user, "stripe_customer_id", None)
    if not stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found. Subscribe first.")

    session = stripe.billing_portal.Session.create(
        customer=stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/dashboard/settings",
    )
    return {"portal_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)) -> dict[str, str]:
    """Handle Stripe webhook events."""
    stripe = _get_stripe()
    if not stripe:
        raise HTTPException(status_code=503, detail="Stripe not available")

    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig, settings.STRIPE_WEBHOOK_SECRET,
        )
    except Exception as e:
        logger.warning("Stripe webhook signature verification failed: %s", e)
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(db, data)
    elif event_type == "customer.subscription.updated":
        _handle_subscription_updated(db, data)
    elif event_type == "customer.subscription.deleted":
        _handle_subscription_deleted(db, data)
    else:
        logger.info("Unhandled Stripe event: %s", event_type)

    return {"status": "ok"}


def _handle_checkout_completed(db: Session, data: dict) -> None:
    """Handle a successful checkout — activate the subscription."""
    user_id = data.get("metadata", {}).get("user_id")
    plan_id = data.get("metadata", {}).get("plan_id")
    if not user_id or not plan_id:
        return
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.plan = plan_id
        plan_def = next((p for p in PLANS if p["id"] == plan_id), None)
        if plan_def:
            user.monthly_content_quota = plan_def["quota"]
        db.commit()
        logger.info("User %s upgraded to plan %s via Stripe checkout", user_id, plan_id)


def _handle_subscription_updated(db: Session, data: dict) -> None:
    """Handle subscription update (e.g., plan change, renewal)."""
    customer_id = data.get("customer")
    if not customer_id:
        return
    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        return
    status = data.get("status")
    if status in ("active", "trialing"):
        # Find the plan from the price ID
        items = data.get("items", {}).get("data", [])
        if items:
            price_id = items[0].get("price", {}).get("id")
            plan = next((p for p in PLANS if p.get("stripe_price_id") == price_id), None)
            if plan:
                user.plan = plan["id"]
                user.monthly_content_quota = plan["quota"]
    elif status in ("canceled", "unpaid", "past_due"):
        user.plan = "free"
        user.monthly_content_quota = 50
    db.commit()


def _handle_subscription_deleted(db: Session, data: dict) -> None:
    """Handle subscription cancellation — downgrade to free."""
    customer_id = data.get("customer")
    if not customer_id:
        return
    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if user:
        user.plan = "free"
        user.monthly_content_quota = 50
        db.commit()
        logger.info("User %s downgraded to free (subscription deleted)", user.id)


@router.get("/status")
async def billing_status(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Return current billing/subscription status."""
    plan = getattr(current_user, "plan", "free") or "free"
    quota_used = getattr(current_user, "monthly_content_used", 0) or 0
    plan_def = next((p for p in PLANS if p["id"] == plan), PLANS[0])

    return {
        "plan_tier": plan,
        "plan_name": plan_def["name"],
        "price": plan_def["price"],
        "quota_used": quota_used,
        "quota_limit": plan_def["quota"],
        "quota_remaining": max(0, plan_def["quota"] - quota_used),
        "features": plan_def["features"],
        "stripe_configured": _stripe_configured(),
        "has_billing_account": bool(getattr(current_user, "stripe_customer_id", None)),
    }
