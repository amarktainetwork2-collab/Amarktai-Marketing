from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.db.base import get_db
from app.models.content import Content as ContentModel
from app.models.analytics import Analytics as AnalyticsModel
from app.models.user import User
from app.schemas.analytics import AnalyticsSummary, PlatformStats, DailyStat
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analytics summary for the current user."""
    total_posts = db.query(ContentModel).filter(
        ContentModel.user_id == current_user.id,
        ContentModel.status == "posted"
    ).count()

    result = db.query(
        func.sum(ContentModel.views).label("total_views"),
        func.sum(ContentModel.likes + ContentModel.comments + ContentModel.shares).label("total_engagement"),
        func.avg(ContentModel.ctr).label("avg_ctr")
    ).filter(
        ContentModel.user_id == current_user.id,
        ContentModel.status == "posted"
    ).first()

    platform_stats = db.query(
        ContentModel.platform,
        func.count(ContentModel.id).label("posts"),
        func.sum(ContentModel.views).label("views"),
        func.sum(ContentModel.likes + ContentModel.comments + ContentModel.shares).label("engagement"),
        func.avg(ContentModel.ctr).label("ctr")
    ).filter(
        ContentModel.user_id == current_user.id,
        ContentModel.status == "posted"
    ).group_by(ContentModel.platform).all()

    platform_breakdown = {}
    for stat in platform_stats:
        platform_breakdown[stat.platform] = PlatformStats(
            posts=stat.posts or 0,
            views=stat.views or 0,
            engagement=stat.engagement or 0,
            ctr=round(stat.ctr or 0, 2)
        )

    daily_stats = []
    for i in range(7):
        date = datetime.now() - timedelta(days=i)
        day_content = db.query(ContentModel).filter(
            ContentModel.user_id == current_user.id,
            ContentModel.status == "posted",
            func.date(ContentModel.posted_at) == date.date()
        ).all()
        daily_stats.append(DailyStat(
            date=date.strftime("%Y-%m-%d"),
            posts=len(day_content),
            views=sum(c.views for c in day_content),
            engagement=sum(c.likes + c.comments + c.shares for c in day_content)
        ))
    daily_stats.reverse()

    return AnalyticsSummary(
        total_posts=total_posts,
        total_views=result.total_views or 0,
        total_engagement=result.total_engagement or 0,
        avg_ctr=round(result.avg_ctr or 0, 2),
        platform_breakdown=platform_breakdown,
        daily_stats=daily_stats
    )

@router.get("/platform/{platform}", response_model=PlatformStats)
async def get_platform_analytics(
    platform: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analytics for a specific platform."""
    result = db.query(
        func.count(ContentModel.id).label("posts"),
        func.sum(ContentModel.views).label("views"),
        func.sum(ContentModel.likes + ContentModel.comments + ContentModel.shares).label("engagement"),
        func.avg(ContentModel.ctr).label("ctr")
    ).filter(
        ContentModel.user_id == current_user.id,
        ContentModel.platform == platform,
        ContentModel.status == "posted"
    ).first()

    return PlatformStats(
        posts=result.posts or 0,
        views=result.views or 0,
        engagement=result.engagement or 0,
        ctr=round(result.ctr or 0, 2)
    )
