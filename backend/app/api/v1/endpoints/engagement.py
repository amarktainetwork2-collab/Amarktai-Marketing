"""
Engagement Replies Endpoints
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.engagement import EngagementReply, EngagementStatus, EngagementPriority
from app.models.user import User
from app.agents.community_agent import CommunityAgent

logger = logging.getLogger(__name__)
router = APIRouter()

# Schemas
class EngagementCreate(BaseModel):
    platform: str
    engagement_type: str  # comment, dm, mention, review
    platform_comment_id: str
    platform_post_id: Optional[str] = None
    author_name: str
    author_platform_id: Optional[str] = None
    original_text: str
    received_at: datetime

class EngagementResponse(BaseModel):
    id: str
    platform: str
    engagement_type: str
    author_name: str
    original_text: str
    ai_reply_text: Optional[str] = None
    ai_reply_confidence: Optional[float] = None
    status: str
    priority: str
    auto_reply_safe: bool
    risk_factors: List[str]
    created_at: datetime

class EngagementUpdate(BaseModel):
    status: Optional[str] = None
    ai_reply_text: Optional[str] = None
    user_edited_text: Optional[str] = None

class ReplyAction(BaseModel):
    action: str  # approve, reject, edit
    edited_text: Optional[str] = None

@router.get("/queue", response_model=List[EngagementResponse])
async def get_engagement_queue(
    status: Optional[str] = None,
    platform: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get engagement reply queue for the current user."""
    query = db.query(EngagementReply).filter(
        EngagementReply.user_id == current_user.id
    )
    
    if status:
        query = query.filter(EngagementReply.status == status)
    if platform:
        query = query.filter(EngagementReply.platform == platform)
    if priority:
        query = query.filter(EngagementReply.priority == priority)
    
    engagements = query.order_by(
        EngagementReply.created_at.desc()
    ).limit(limit).all()
    
    return engagements

@router.get("/stats")
async def get_engagement_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get engagement statistics."""
    from sqlalchemy import func
    
    stats = db.query(
        EngagementReply.status,
        func.count(EngagementReply.id).label("count")
    ).filter(
        EngagementReply.user_id == current_user.id
    ).group_by(EngagementReply.status).all()
    
    # Get counts by platform
    platform_stats = db.query(
        EngagementReply.platform,
        func.count(EngagementReply.id).label("count")
    ).filter(
        EngagementReply.user_id == current_user.id
    ).group_by(EngagementReply.platform).all()
    
    # Get pending count
    pending_count = db.query(EngagementReply).filter(
        EngagementReply.user_id == current_user.id,
        EngagementReply.status.in_(["pending", "generating", "ready"])
    ).count()
    
    return {
        "by_status": {s.status: s.count for s in stats},
        "by_platform": {p.platform: p.count for p in platform_stats},
        "pending_count": pending_count,
        "total_engagements": sum(s.count for s in stats)
    }

@router.post("/incoming", status_code=status.HTTP_201_CREATED)
async def receive_engagement(
    engagement: EngagementCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Receive a new engagement (comment/DM) and queue for AI reply generation."""
    
    # Create engagement record
    new_engagement = EngagementReply(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        platform=engagement.platform,
        engagement_type=engagement.engagement_type,
        platform_comment_id=engagement.platform_comment_id,
        platform_post_id=engagement.platform_post_id,
        author_name=engagement.author_name,
        author_platform_id=engagement.author_platform_id,
        original_text=engagement.original_text,
        received_at=engagement.received_at,
        status=EngagementStatus.PENDING
    )
    
    db.add(new_engagement)
    db.commit()
    
    # Trigger AI reply generation in background
    background_tasks.add_task(
        generate_reply_background,
        new_engagement.id,
        current_user.id
    )
    
    return {
        "id": new_engagement.id,
        "status": "queued",
        "message": "Engagement received and queued for AI reply generation"
    }

async def generate_reply_background(engagement_id: str, user_id: str):
    """Background task to generate an AI reply."""
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        engagement = db.query(EngagementReply).filter(
            EngagementReply.id == engagement_id
        ).first()

        if not engagement:
            return

        # Update status to generating
        engagement.status = EngagementStatus.GENERATING
        db.commit()

        # Get user's webapp data for context
        from app.models.webapp import WebApp
        webapp = db.query(WebApp).filter(
            WebApp.user_id == user_id
        ).first()

        webapp_name = webapp.name if webapp else "our product"
        webapp_data = {
            "name": webapp_name,
            "description": webapp.description if webapp else "",
            "key_features": webapp.key_features if webapp else []
        } if webapp else {}

        # Use HuggingFace for reply generation if token available
        from app.models.user_api_key import UserAPIKey
        from app.core.config import settings as app_settings

        hf_row = db.query(UserAPIKey).filter_by(
            user_id=user_id, key_name="HUGGINGFACE_TOKEN", is_active=True
        ).first()
        hf_token = hf_row.get_decrypted_key() if hf_row else app_settings.HUGGINGFACE_TOKEN

        # First use local CommunityAgent for sentiment analysis (fast, no API call)
        agent = CommunityAgent(webapp_data=webapp_data)
        analysis = await agent.analyze_engagement(
            text=engagement.original_text,
            platform=engagement.platform,
            engagement_type=engagement.engagement_type
        )

        # Use HF for higher-quality reply if token available
        if hf_token:
            try:
                from app.services.hf_generator import HuggingFaceGenerator
                generator = HuggingFaceGenerator(hf_token)
                hf_result = await generator.generate_comment_reply(
                    comment_text=engagement.original_text,
                    platform=engagement.platform,
                    webapp_name=webapp_name,
                    sentiment=analysis.sentiment,
                )
                reply_text = hf_result.get("reply", "")
                reply_confidence = float(hf_result.get("confidence", 0.7))
            except Exception:
                # Fall back to local agent
                local_reply = await agent.generate_reply(
                    original_text=engagement.original_text,
                    analysis=analysis,
                    platform=engagement.platform,
                )
                reply_text = local_reply.text
                reply_confidence = local_reply.confidence
        else:
            local_reply = await agent.generate_reply(
                original_text=engagement.original_text,
                analysis=analysis,
                platform=engagement.platform,
            )
            reply_text = local_reply.text
            reply_confidence = local_reply.confidence

        # Update engagement with analysis and reply
        engagement.sentiment = analysis.sentiment
        engagement.sentiment_score = str(analysis.sentiment_score)
        engagement.ai_reply_text = reply_text
        engagement.ai_reply_confidence = str(reply_confidence)
        engagement.status = EngagementStatus.READY
        engagement.priority = analysis.urgency
        engagement.auto_reply_safe = analysis.auto_reply_safe
        engagement.risk_factors = analysis.risk_factors
        engagement.generated_at = datetime.now()

        # Auto-send if safe and user has enabled low-risk auto-reply
        if analysis.auto_reply_safe:
            user = db.query(User).filter(User.id == user_id).first()
            if user and user.low_risk_auto_reply:
                engagement.status = EngagementStatus.AUTO_SENT
                engagement.sent_at = datetime.now()

        db.commit()

    except Exception as e:
        if engagement:
            engagement.status = EngagementStatus.PENDING
            db.commit()
        print(f"Error generating reply: {e}")
    finally:
        db.close()


@router.get("/{engagement_id}")
async def get_engagement(
    engagement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific engagement with its AI reply."""
    engagement = db.query(EngagementReply).filter(
        EngagementReply.id == engagement_id,
        EngagementReply.user_id == current_user.id
    ).first()
    
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    
    return engagement


async def _dispatch_reply_to_platform(
    db: Session,
    user: User,
    platform: str,
    comment_id: str,
    reply_text: str,
) -> Dict[str, Any]:
    """
    Send a reply to the actual platform API.
    Returns {"success": True/False, "error": "..."}.
    """
    from app.models.platform_connection import PlatformConnection as PlatformModel, PlatformType
    from app.models.user_api_key import UserAPIKey

    # Find the user's platform connection
    try:
        platform_type = PlatformType(platform)
    except ValueError:
        return {"success": False, "error": f"Unsupported platform: {platform}"}

    conn = db.query(PlatformModel).filter(
        PlatformModel.user_id == user.id,
        PlatformModel.platform == platform_type,
        PlatformModel.is_active == True,
    ).first()

    if not conn or not conn.access_token:
        return {"success": False, "error": f"No active {platform} connection. Complete OAuth first."}

    # Decrypt the token
    try:
        access_token = UserAPIKey.decrypt_key(conn.access_token)
    except Exception:
        access_token = conn.access_token

    # Dispatch based on platform
    try:
        if platform == "twitter":
            from app.integrations.platforms.twitter import TwitterPlatform
            from app.core.config import settings
            tw = TwitterPlatform(
                access_token=access_token,
                api_key=settings.TWITTER_API_KEY,
                api_secret=settings.TWITTER_API_SECRET,
            )
            result = tw.reply(comment_id, reply_text)
            return result

        elif platform == "facebook":
            from app.integrations.platforms.facebook import FacebookPlatform
            fb = FacebookPlatform(access_token=access_token)
            result = fb.reply(comment_id, reply_text)
            return result

        elif platform in ("instagram", "youtube", "linkedin", "tiktok"):
            return {"success": False, "error": f"Reply dispatch not yet supported for {platform}. Reply approved but not sent."}

        else:
            return {"success": False, "error": f"Reply dispatch not implemented for {platform}"}

    except Exception as e:
        logger.error("Failed to dispatch reply to %s: %s", platform, e)
        return {"success": False, "error": str(e)}


@router.post("/{engagement_id}/action")
async def action_engagement(
    engagement_id: str,
    action: ReplyAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve, reject, or edit an engagement reply. Dispatches to platform API on approve."""
    engagement = db.query(EngagementReply).filter(
        EngagementReply.id == engagement_id,
        EngagementReply.user_id == current_user.id
    ).first()
    
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    
    if action.action == "approve":
        engagement.status = EngagementStatus.APPROVED
        engagement.approved_at = datetime.now()
        engagement.approved_by = current_user.id
        
        # Dispatch the reply to the platform
        reply_text = engagement.ai_reply_text or ""
        send_result = await _dispatch_reply_to_platform(
            db, current_user, engagement.platform,
            engagement.platform_comment_id, reply_text,
        )
        if send_result.get("success"):
            engagement.status = EngagementStatus.SENT
            engagement.sent_at = datetime.now()
        else:
            engagement.status = EngagementStatus.APPROVED  # Keep as approved, not sent
            engagement.risk_factors = (engagement.risk_factors or []) + [
                f"Send failed: {send_result.get('error', 'unknown')}"
            ]
        
    elif action.action == "reject":
        engagement.status = EngagementStatus.REJECTED
        
    elif action.action == "edit":
        if not action.edited_text:
            raise HTTPException(status_code=400, detail="Edited text required")
        
        engagement.user_edited_text = action.edited_text
        engagement.edited_by_user = True
        engagement.status = EngagementStatus.APPROVED
        engagement.approved_at = datetime.now()
        engagement.approved_by = current_user.id
        
        # Dispatch the edited reply to the platform
        send_result = await _dispatch_reply_to_platform(
            db, current_user, engagement.platform,
            engagement.platform_comment_id, action.edited_text,
        )
        if send_result.get("success"):
            engagement.status = EngagementStatus.SENT
            engagement.sent_at = datetime.now()
        else:
            engagement.risk_factors = (engagement.risk_factors or []) + [
                f"Send failed: {send_result.get('error', 'unknown')}"
            ]
    
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    db.commit()
    
    return {
        "message": f"Engagement {action.action}d successfully",
        "status": engagement.status
    }

@router.post("/{engagement_id}/regenerate")
async def regenerate_reply(
    engagement_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Regenerate AI reply for an engagement."""
    engagement = db.query(EngagementReply).filter(
        EngagementReply.id == engagement_id,
        EngagementReply.user_id == current_user.id
    ).first()
    
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    
    # Reset and requeue
    engagement.status = EngagementStatus.PENDING
    engagement.ai_reply_text = None
    engagement.ai_reply_confidence = None
    db.commit()
    
    # Trigger regeneration
    background_tasks.add_task(
        generate_reply_background,
        engagement.id,
        current_user.id
    )
    
    return {"message": "Reply regeneration queued"}

@router.post("/batch-action")
async def batch_action(
    engagement_ids: List[str],
    action: str,  # approve, reject
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Perform action on multiple engagements at once."""
    engagements = db.query(EngagementReply).filter(
        EngagementReply.id.in_(engagement_ids),
        EngagementReply.user_id == current_user.id
    ).all()
    
    processed = 0
    for engagement in engagements:
        if action == "approve":
            engagement.status = EngagementStatus.SENT
            engagement.sent_at = datetime.now()
            engagement.approved_by = current_user.id
            processed += 1
        elif action == "reject":
            engagement.status = EngagementStatus.REJECTED
            processed += 1
    
    db.commit()
    
    return {
        "message": f"{action}d {processed} engagements",
        "processed": processed
    }
