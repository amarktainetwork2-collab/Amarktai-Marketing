"""
Lead Capture & Management Endpoints

Provides endpoints for:
  - Capturing new leads (public form endpoint, no auth required)
  - Listing, filtering and exporting leads (authenticated)
  - Updating lead status / qualification
  - Generating UTM tracking links for content posts
"""

from __future__ import annotations

import csv
import io
import uuid
from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.lead import Lead
from app.models.user import User

router = APIRouter()


# ─── Schemas ────────────────────────────────────────────────────────────────

class LeadCapture(BaseModel):
    """Public-facing lead capture form payload."""
    name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    # UTM parameters injected automatically from the link
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None
    # Pre-qualifying answers (free-form key/value)
    qualifiers: Optional[dict] = None
    # Link back to the webapp / user
    webapp_id: Optional[str] = None
    user_id: str   # required so we know which account owns the lead


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    is_qualified: Optional[bool] = None
    qualification_notes: Optional[str] = None
    lead_score: Optional[int] = None
    conversion_value: Optional[str] = None


class LeadResponse(BaseModel):
    id: str
    name: Optional[str]
    email: str
    phone: Optional[str]
    company: Optional[str]
    source_platform: Optional[str]
    utm_source: Optional[str]
    utm_medium: Optional[str]
    utm_campaign: Optional[str]
    qualifiers: Optional[dict]
    lead_score: int
    is_qualified: bool
    status: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UTMLinkRequest(BaseModel):
    base_url: str
    campaign: str
    platform: str
    content_id: Optional[str] = None
    medium: str = "social"


# ─── Public endpoint: capture a lead ────────────────────────────────────────

@router.post("/capture", status_code=201)
async def capture_lead(payload: LeadCapture, db: Session = Depends(get_db)):
    """
    Public endpoint — no authentication required.
    Called from the lead capture form embedded in content or landing pages.
    """
    # Validate user exists
    from app.models.user import User as UserModel
    user = db.query(UserModel).filter(UserModel.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    # Deduplicate by email + user
    existing = (
        db.query(Lead)
        .filter(Lead.user_id == payload.user_id, Lead.email == payload.email)
        .first()
    )
    if existing:
        # Update qualification data if it changed
        if payload.qualifiers:
            existing.qualifiers = {**(existing.qualifiers or {}), **payload.qualifiers}
        db.commit()
        return {"message": "Lead updated", "lead_id": existing.id}

    # Determine source platform from utm_source
    source_platform = payload.utm_source or None

    # Simple rule-based lead score + optional HF sentiment boost
    score = _calculate_lead_score(payload.qualifiers or {})

    # If qualifiers contain text, try HF scoring (fire-and-forget enrichment)
    qualifier_text = " ".join(str(v) for v in (payload.qualifiers or {}).values() if v)
    if qualifier_text and len(qualifier_text) > 10:
        try:
            from app.models.user_api_key import UserAPIKey
            from app.core.config import settings as app_settings
            from app.services.hf_generator import HuggingFaceGenerator
            hf_row = db.query(UserAPIKey).filter_by(
                user_id=payload.user_id, key_name="HUGGINGFACE_TOKEN", is_active=True
            ).first()
            hf_token = hf_row.get_decrypted_key() if hf_row else app_settings.HUGGINGFACE_TOKEN
            if hf_token:
                import asyncio
                generator = HuggingFaceGenerator(hf_token)
                score = asyncio.run(generator.score_lead_intelligence(qualifier_text, score))
        except Exception:
            pass  # Use rule-based score on failure

    lead = Lead(
        id=str(uuid.uuid4()),
        user_id=payload.user_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        company=payload.company,
        source_platform=source_platform,
        source_webapp_id=payload.webapp_id,
        utm_source=payload.utm_source,
        utm_medium=payload.utm_medium,
        utm_campaign=payload.utm_campaign,
        utm_content=payload.utm_content,
        utm_term=payload.utm_term,
        qualifiers=payload.qualifiers or {},
        lead_score=score,
        is_qualified=(score >= 60),
        status="new",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return {"message": "Lead captured", "lead_id": lead.id}


# ─── Authenticated endpoints ─────────────────────────────────────────────────

@router.get("/", response_model=List[LeadResponse])
async def list_leads(
    status: Optional[str] = None,
    platform: Optional[str] = None,
    is_qualified: Optional[bool] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all leads for the current user with optional filters."""
    q = db.query(Lead).filter(Lead.user_id == current_user.id)
    if status:
        q = q.filter(Lead.status == status)
    if platform:
        q = q.filter(Lead.source_platform == platform)
    if is_qualified is not None:
        q = q.filter(Lead.is_qualified == is_qualified)
    return q.order_by(Lead.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/stats")
async def lead_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregate lead statistics for the dashboard."""
    from sqlalchemy import func

    total = db.query(func.count(Lead.id)).filter(Lead.user_id == current_user.id).scalar() or 0
    qualified = (
        db.query(func.count(Lead.id))
        .filter(Lead.user_id == current_user.id, Lead.is_qualified == True)
        .scalar()
        or 0
    )
    converted = (
        db.query(func.count(Lead.id))
        .filter(Lead.user_id == current_user.id, Lead.status == "converted")
        .scalar()
        or 0
    )

    # Leads by platform
    by_platform = (
        db.query(Lead.source_platform, func.count(Lead.id))
        .filter(Lead.user_id == current_user.id, Lead.source_platform != None)
        .group_by(Lead.source_platform)
        .all()
    )

    return {
        "total": total,
        "qualified": qualified,
        "converted": converted,
        "qualification_rate": round((qualified / total) * 100, 1) if total else 0,
        "conversion_rate": round((converted / total) * 100, 1) if total else 0,
        "by_platform": {p: c for p, c in by_platform},
    }


@router.get("/export/csv")
async def export_leads_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export all leads as a CSV file."""
    leads = (
        db.query(Lead)
        .filter(Lead.user_id == current_user.id)
        .order_by(Lead.created_at.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "id", "name", "email", "phone", "company", "source_platform",
        "utm_source", "utm_medium", "utm_campaign", "lead_score",
        "is_qualified", "status", "notes", "created_at",
    ])
    for lead in leads:
        writer.writerow([
            lead.id, lead.name, lead.email, lead.phone, lead.company,
            lead.source_platform, lead.utm_source, lead.utm_medium,
            lead.utm_campaign, lead.lead_score, lead.is_qualified,
            lead.status, lead.notes, lead.created_at,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads.csv"},
    )


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id, Lead.user_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    update: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id, Lead.user_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)

    if update.status == "converted" and not lead.converted_at:
        lead.converted_at = datetime.utcnow()

    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id, Lead.user_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()


# ─── UTM link generator ───────────────────────────────────────────────────────

@router.post("/utm/generate")
async def generate_utm_link(
    payload: UTMLinkRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate a UTM-tagged link for a social media post.
    This link tracks which platform/campaign drove the traffic.
    """
    from urllib.parse import urlencode, urlparse, urlunparse, parse_qs

    parsed = urlparse(payload.base_url)
    params: dict[str, str] = {
        "utm_source": payload.platform,
        "utm_medium": payload.medium,
        "utm_campaign": payload.campaign,
    }
    if payload.content_id:
        params["utm_content"] = payload.content_id

    # Preserve any existing query params
    existing_qs = parse_qs(parsed.query)
    existing_qs.update({k: [v] for k, v in params.items()})
    new_query = urlencode({k: v[0] for k, v in existing_qs.items()})
    utm_url = urlunparse(parsed._replace(query=new_query))

    return {
        "utm_url": utm_url,
        "params": params,
        "tracking_note": (
            "Share this link in your post. When visitors click it, their "
            "source platform is automatically recorded in your leads dashboard."
        ),
    }


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _calculate_lead_score(qualifiers: dict) -> int:
    """
    Simple rule-based lead score (0-100).
    Extend this with HF sentiment/classification for production.
    """
    score = 30  # base score for any lead

    # Company info provided
    if qualifiers.get("company"):
        score += 10

    # Budget indicator
    budget = str(qualifiers.get("budget", "")).lower()
    if any(x in budget for x in ["10000", "5000", "high", "large"]):
        score += 25
    elif any(x in budget for x in ["1000", "2000", "medium"]):
        score += 15
    elif any(x in budget for x in ["0", "free", "none", "low"]):
        score += 0

    # Timeline
    timeline = str(qualifiers.get("timeline", "")).lower()
    if any(x in timeline for x in ["immediately", "1 month", "asap"]):
        score += 20
    elif any(x in timeline for x in ["3 month", "quarter"]):
        score += 10

    # Phone number provided
    if qualifiers.get("phone"):
        score += 10

    return min(score, 100)
