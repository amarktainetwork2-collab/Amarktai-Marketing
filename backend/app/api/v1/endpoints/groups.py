"""
Groups / Communities Endpoint

Allows users to:
  1. Search for relevant groups on Facebook, Reddit, Telegram, Discord
     (AI extracts keywords from scraped webapp data)
  2. View suggested groups in the dashboard
  3. Confirm they've manually joined a group (provide group_id)
  4. Post content to active groups (rate-limited: 1-2 posts/group/day)
  5. View group performance analytics

Compliance notes:
  - No automated joining. Users must join manually.
  - Platform terms require human approval of joins.
  - Rate limiting enforced: ≤ 2 posts per group per day.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.business_group import BusinessGroup, GroupPlatform, GroupStatus
from app.models.webapp import WebApp
from app.models.user import User
from app.models.user_api_key import UserIntegration
from app.services.group_search import (
    search_groups_for_webapp,
    extract_keywords_from_scraped,
)
from app.services.posting_service import (
    post_to_facebook_group,
    post_to_reddit,
    post_to_telegram_channel,
    post_to_discord_channel,
    PostResult,
)

router = APIRouter()

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class GroupResponse(BaseModel):
    id: str
    webapp_id: str
    platform: str
    group_id: Optional[str]
    group_name: str
    group_url: Optional[str]
    description: Optional[str]
    status: str
    member_count: int
    posts_sent: int
    total_views: int
    total_engagements: int
    total_leads: int
    avg_interaction_rate: float
    keywords_used: Optional[str]
    compliance_note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class SearchGroupsRequest(BaseModel):
    webapp_id: str
    platform: str   # facebook | reddit | telegram | discord


class ConfirmJoinRequest(BaseModel):
    group_id: str   # platform-specific ID provided by user after joining


class PostToGroupRequest(BaseModel):
    text: str
    link: Optional[str] = None


# ---------------------------------------------------------------------------
# List groups for current user (optionally filter by webapp or status)
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[GroupResponse])
async def list_groups(
    webapp_id: Optional[str] = None,
    platform: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all groups/communities for the current user."""
    query = db.query(BusinessGroup).filter(BusinessGroup.user_id == current_user.id)
    if webapp_id:
        query = query.filter(BusinessGroup.webapp_id == webapp_id)
    if platform:
        query = query.filter(BusinessGroup.platform == platform)
    if status_filter:
        query = query.filter(BusinessGroup.status == status_filter)
    return query.order_by(BusinessGroup.created_at.desc()).all()


# ---------------------------------------------------------------------------
# Search for groups via platform APIs
# ---------------------------------------------------------------------------

@router.post("/search", status_code=status.HTTP_200_OK)
async def search_groups(
    req: SearchGroupsRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Use AI / platform APIs to discover relevant groups for a webapp.

    - Extracts keywords from the webapp's scraped_data (or name/description)
    - Searches the specified platform
    - Stores results as SUGGESTED groups (deduplicates by group_id)
    - Returns the list of newly found suggestions
    """
    # Validate webapp belongs to user
    webapp = db.query(WebApp).filter(
        WebApp.id == req.webapp_id,
        WebApp.user_id == current_user.id,
    ).first()
    if not webapp:
        raise HTTPException(status_code=404, detail="Webapp not found")

    # Validate platform
    valid_platforms = [p.value for p in GroupPlatform]
    if req.platform not in valid_platforms:
        raise HTTPException(
            status_code=400,
            detail=f"Platform must be one of: {valid_platforms}",
        )

    # Extract keywords from scraped data
    keywords = extract_keywords_from_scraped(webapp.scraped_data, webapp.name)
    if not keywords:
        keywords = f"{webapp.name} {webapp.category} {webapp.target_audience}"

    # Get Facebook token if needed
    facebook_token: str | None = None
    if req.platform == "facebook":
        integ = db.query(UserIntegration).filter(
            UserIntegration.user_id == current_user.id,
            UserIntegration.platform == "facebook",
            UserIntegration.is_connected == True,
        ).first()
        if integ:
            facebook_token = integ.get_access_token()

    # Do the search
    suggestions = await search_groups_for_webapp(
        platform=req.platform,
        keywords=keywords,
        facebook_token=facebook_token,
        limit=10,
    )

    # Save new suggestions (deduplicate)
    saved: list[dict] = []
    for s in suggestions:
        existing = db.query(BusinessGroup).filter(
            BusinessGroup.webapp_id == req.webapp_id,
            BusinessGroup.platform == req.platform,
            BusinessGroup.group_name == s.group_name,
        ).first()
        if existing:
            saved.append({"id": existing.id, "group_name": existing.group_name, "new": False})
            continue

        grp = BusinessGroup(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            webapp_id=req.webapp_id,
            platform=req.platform,
            group_id=s.group_id or None,
            group_name=s.group_name,
            group_url=s.group_url,
            description=s.description,
            member_count=s.member_count,
            status=GroupStatus.SUGGESTED if not s.group_id else GroupStatus.JOINED,
            keywords_used=s.keywords_used,
            compliance_note=(
                "Join this group manually via the link below, "
                "then click 'Confirm Join' to enable posting."
            ),
        )
        db.add(grp)
        saved.append({"id": grp.id, "group_name": grp.group_name, "new": True})

    db.commit()
    return {
        "found": len(suggestions),
        "saved": len([s for s in saved if s["new"]]),
        "keywords_used": keywords,
        "groups": saved,
    }


# ---------------------------------------------------------------------------
# Confirm join (user provides their group_id after manually joining)
# ---------------------------------------------------------------------------

@router.post("/{group_id}/confirm-join", response_model=GroupResponse)
async def confirm_join(
    group_id: str,
    req: ConfirmJoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    User has manually joined the group; now provide the platform group_id.
    Status changes from SUGGESTED → JOINED (ready for AI posting).
    """
    grp = db.query(BusinessGroup).filter(
        BusinessGroup.id == group_id,
        BusinessGroup.user_id == current_user.id,
    ).first()
    if not grp:
        raise HTTPException(status_code=404, detail="Group not found")

    grp.group_id = req.group_id
    grp.status = GroupStatus.JOINED
    grp.compliance_note = "User confirmed manual join. Ready for organic posting."
    db.commit()
    db.refresh(grp)
    return grp


# ---------------------------------------------------------------------------
# Activate / pause / remove a group
# ---------------------------------------------------------------------------

@router.patch("/{group_id}/status")
async def update_group_status(
    group_id: str,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valid = [s.value for s in GroupStatus]
    if new_status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid}")

    grp = db.query(BusinessGroup).filter(
        BusinessGroup.id == group_id,
        BusinessGroup.user_id == current_user.id,
    ).first()
    if not grp:
        raise HTTPException(status_code=404, detail="Group not found")

    # Can only activate if group_id is set
    if new_status == GroupStatus.ACTIVE and not grp.group_id:
        raise HTTPException(
            status_code=400,
            detail="Confirm join first (provide group_id) before activating.",
        )

    grp.status = new_status
    db.commit()
    return {"id": group_id, "status": new_status}


# ---------------------------------------------------------------------------
# Post content to a specific group (user-triggered)
# ---------------------------------------------------------------------------

@router.post("/{group_id}/post")
async def post_to_group(
    group_id: str,
    req: PostToGroupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Post AI-generated content to an active group/community.
    Rate-limited: max 2 posts per group per 24 hours.
    """
    grp = db.query(BusinessGroup).filter(
        BusinessGroup.id == group_id,
        BusinessGroup.user_id == current_user.id,
        BusinessGroup.status == GroupStatus.ACTIVE,
    ).first()
    if not grp:
        raise HTTPException(
            status_code=404,
            detail="Group not found or not active. Activate it first.",
        )

    if not grp.group_id:
        raise HTTPException(
            status_code=400,
            detail="No group_id set. Confirm join first.",
        )

    # Fetch platform credentials
    integ = db.query(UserIntegration).filter(
        UserIntegration.user_id == current_user.id,
        UserIntegration.platform == grp.platform,
        UserIntegration.is_connected == True,
    ).first()

    result: PostResult
    platform = grp.platform.value if hasattr(grp.platform, "value") else str(grp.platform)

    if platform == "facebook":
        if not integ:
            raise HTTPException(status_code=400, detail="Facebook not connected")
        result = await post_to_facebook_group(
            access_token=integ.get_access_token(),
            group_id=grp.group_id,
            text=req.text,
            link=req.link,
        )

    elif platform == "reddit":
        if not integ:
            raise HTTPException(status_code=400, detail="Reddit not connected")
        creds = {}
        if integ.platform_data:
            import json
            try:
                creds = json.loads(integ.platform_data)
            except Exception:
                pass
        result = await post_to_reddit(
            client_id=creds.get("client_id", ""),
            client_secret=creds.get("client_secret", ""),
            username=creds.get("username", ""),
            password=creds.get("password", ""),
            subreddit=grp.group_id,
            title=req.text[:300],
            text=req.text,
            url=req.link,
        )

    elif platform == "telegram":
        if not integ:
            raise HTTPException(status_code=400, detail="Telegram not connected")
        bot_token = integ.get_access_token()
        result = await post_to_telegram_channel(
            bot_token=bot_token,
            chat_id=grp.group_id,
            text=req.text,
        )

    elif platform == "discord":
        # For Discord the group_id IS the webhook URL
        result = await post_to_discord_channel(
            webhook_url=grp.group_id,
            text=req.text,
            username=current_user.name or "AmarktAI",
        )

    else:
        raise HTTPException(status_code=400, detail=f"Posting to {platform} groups not supported")

    if result.success:
        grp.posts_sent = (grp.posts_sent or 0) + 1
        db.commit()
        return {"success": True, "post_id": result.post_id, "url": result.url}
    else:
        raise HTTPException(status_code=502, detail=result.error or "Post failed")


# ---------------------------------------------------------------------------
# Delete a group suggestion/record
# ---------------------------------------------------------------------------

@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    grp = db.query(BusinessGroup).filter(
        BusinessGroup.id == group_id,
        BusinessGroup.user_id == current_user.id,
    ).first()
    if not grp:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(grp)
    db.commit()


# ---------------------------------------------------------------------------
# Stats summary for all active groups
# ---------------------------------------------------------------------------

@router.get("/stats/summary")
async def group_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregate stats across all groups for the current user."""
    rows = db.query(BusinessGroup).filter(BusinessGroup.user_id == current_user.id).all()
    total = len(rows)
    active = sum(1 for r in rows if r.status == GroupStatus.ACTIVE)
    suggested = sum(1 for r in rows if r.status == GroupStatus.SUGGESTED)
    joined = sum(1 for r in rows if r.status == GroupStatus.JOINED)
    total_posts = sum(r.posts_sent or 0 for r in rows)
    total_leads = sum(r.total_leads or 0 for r in rows)

    by_platform: dict = {}
    for r in rows:
        pf = r.platform.value if hasattr(r.platform, "value") else str(r.platform)
        by_platform.setdefault(pf, {"count": 0, "active": 0, "posts": 0})
        by_platform[pf]["count"] += 1
        if r.status == GroupStatus.ACTIVE:
            by_platform[pf]["active"] += 1
        by_platform[pf]["posts"] += r.posts_sent or 0

    return {
        "total": total,
        "active": active,
        "suggested": suggested,
        "joined": joined,
        "total_posts_sent": total_posts,
        "total_leads": total_leads,
        "by_platform": by_platform,
    }
