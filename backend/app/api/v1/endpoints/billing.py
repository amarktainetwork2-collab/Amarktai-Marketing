"""
Stripe billing endpoints — checkout, webhook, and customer portal.

POST /api/v1/billing/checkout-session  — create a Stripe Checkout Session
POST /api/v1/billing/webhook           — Stripe webhook handler
POST /api/v1/billing/portal-session    — create a Stripe Customer Portal session
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.base import get_db
from app.models.user import PlanType, User

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    plan: str  # "pro", "business", "enterprise"


class CheckoutResponse(BaseModel):
    url: str


class PortalResponse(BaseModel):
    url: str


# ── Plan → Stripe Price ID mapping ──────────────────────────────────────────

_PLAN_PRICE_MAP: dict[str, str] = {
    "pro": settings.STRIPE_PRICE_ID_PRO,
    "business": settings.STRIPE_PRICE_ID_BUSINESS,
    "enterprise": settings.STRIPE_PRICE_ID_ENTERPRISE,
}


def _get_stripe():
    """Lazy-import stripe and verify API key is set."""
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured. Set STRIPE_SECRET_KEY in environment.",
        )
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


# ── POST /billing/checkout-session ───────────────────────────────────────────

@router.post("/checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CheckoutResponse:
    """Create a Stripe Checkout Session for the selected plan."""
    stripe = _get_stripe()

    price_id = _PLAN_PRICE_MAP.get(body.plan)
    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan '{body.plan}'. Must be one of: pro, business, enterprise.",
        )

    # Reuse existing Stripe customer or create one
    customer_id = getattr(current_user, "stripe_customer_id", None)
    if not customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            metadata={"user_id": current_user.id},
        )
        current_user.stripe_customer_id = customer.id
        db.commit()
        customer_id = customer.id

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{settings.FRONTEND_URL}/dashboard/settings?billing=success",
        cancel_url=f"{settings.FRONTEND_URL}/pricing?billing=cancelled",
        subscription_data={"trial_period_days": 7},
        metadata={"user_id": current_user.id, "plan": body.plan},
    )

    return CheckoutResponse(url=session.url)


# ── POST /billing/portal-session ─────────────────────────────────────────────

@router.post("/portal-session", response_model=PortalResponse)
async def create_portal_session(
    current_user: User = Depends(get_current_user),
) -> PortalResponse:
    """Create a Stripe Customer Portal session for self-service billing."""
    stripe = _get_stripe()

    customer_id = getattr(current_user, "stripe_customer_id", None)
    if not customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No billing account found. Please subscribe to a plan first.",
        )

    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.FRONTEND_URL}/dashboard/settings",
    )

    return PortalResponse(url=session.url)


# ── POST /billing/webhook ────────────────────────────────────────────────────

_PLAN_FROM_PRICE: dict[str, PlanType] = {}


def _resolve_plan(price_id: str) -> PlanType:
    """Map a Stripe price ID back to PlanType."""
    if not _PLAN_FROM_PRICE:
        # Build reverse map on first call
        if settings.STRIPE_PRICE_ID_PRO:
            _PLAN_FROM_PRICE[settings.STRIPE_PRICE_ID_PRO] = PlanType.PRO
        if settings.STRIPE_PRICE_ID_BUSINESS:
            _PLAN_FROM_PRICE[settings.STRIPE_PRICE_ID_BUSINESS] = PlanType.BUSINESS
        if settings.STRIPE_PRICE_ID_ENTERPRISE:
            _PLAN_FROM_PRICE[settings.STRIPE_PRICE_ID_ENTERPRISE] = PlanType.ENTERPRISE
    return _PLAN_FROM_PRICE.get(price_id, PlanType.FREE)


# Quota limits per plan
PLAN_QUOTAS: dict[PlanType, int] = {
    PlanType.FREE: 50,
    PlanType.PRO: 500,
    PlanType.BUSINESS: 2000,
    PlanType.ENTERPRISE: 99999,
}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Handle Stripe webhook events."""
    stripe = _get_stripe()

    payload = await request.body()

    if settings.STRIPE_WEBHOOK_SECRET and stripe_signature:
        try:
            event = stripe.Webhook.construct_event(
                payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception as exc:
            logger.warning("Stripe webhook signature verification failed: %s", exc)
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        import json
        event = json.loads(payload)

    event_type = event.get("type", "")
    data = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(data, db)
    elif event_type == "customer.subscription.updated":
        _handle_subscription_updated(data, db)
    elif event_type == "customer.subscription.deleted":
        _handle_subscription_deleted(data, db)
    else:
        logger.info("Unhandled Stripe event: %s", event_type)

    return {"received": True}


def _handle_checkout_completed(data: dict, db: Session) -> None:
    """Set the user's plan after successful checkout."""
    customer_id = data.get("customer")
    if not customer_id:
        return
    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        logger.warning("Stripe checkout completed for unknown customer: %s", customer_id)
        return

    # Get plan from metadata or subscription items
    plan_name = (data.get("metadata") or {}).get("plan", "pro")
    plan = PlanType(plan_name) if plan_name in [p.value for p in PlanType] else PlanType.PRO
    user.plan = plan
    user.plan_tier = plan.value
    user.plan_quota_content = PLAN_QUOTAS.get(plan, 50)
    user.monthly_content_quota = PLAN_QUOTAS.get(plan, 50)
    db.commit()
    logger.info("User %s upgraded to %s via Stripe checkout", user.id, plan.value)


def _handle_subscription_updated(data: dict, db: Session) -> None:
    """Update plan when subscription changes (upgrade/downgrade)."""
    customer_id = data.get("customer")
    if not customer_id:
        return
    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        return

    items = data.get("items", {}).get("data", [])
    if items:
        price_id = items[0].get("price", {}).get("id", "")
        plan = _resolve_plan(price_id)
        user.plan = plan
        user.plan_tier = plan.value
        user.plan_quota_content = PLAN_QUOTAS.get(plan, 50)
        user.monthly_content_quota = PLAN_QUOTAS.get(plan, 50)
        db.commit()
        logger.info("User %s subscription updated to %s", user.id, plan.value)


def _handle_subscription_deleted(data: dict, db: Session) -> None:
    """Downgrade to free when subscription is cancelled."""
    customer_id = data.get("customer")
    if not customer_id:
        return
    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        return

    user.plan = PlanType.FREE
    user.plan_tier = "free"
    user.plan_quota_content = PLAN_QUOTAS[PlanType.FREE]
    user.monthly_content_quota = PLAN_QUOTAS[PlanType.FREE]
    db.commit()
    logger.info("User %s subscription cancelled — downgraded to free", user.id)
