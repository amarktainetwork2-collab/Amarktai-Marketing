"""CSV export endpoint for analytics data."""

from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.analytics import Analytics
from app.models.user import User

router = APIRouter()

_CSV_COLUMNS = ["date", "platform", "views", "likes", "comments", "shares", "engagement_rate"]


def _engagement_rate(row: Analytics) -> float:
    """Calculate engagement rate as (likes + comments + shares) / views."""
    total = (row.likes or 0) + (row.comments or 0) + (row.shares or 0)
    views = row.views or 0
    if views == 0:
        return 0.0
    return round(total / views, 6)


def _generate_csv(rows: list[Analytics]):
    """Yield CSV content line-by-line for streaming."""
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(_CSV_COLUMNS)
    yield buf.getvalue()
    buf.seek(0)
    buf.truncate(0)

    for row in rows:
        writer.writerow([
            str(row.date),
            row.platform,
            row.views or 0,
            row.likes or 0,
            row.comments or 0,
            row.shares or 0,
            _engagement_rate(row),
        ])
        yield buf.getvalue()
        buf.seek(0)
        buf.truncate(0)


@router.get("/export")
async def export_analytics(
    format: str = Query("csv", description="Export format (csv)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export the current user's analytics data as a CSV file."""
    if format.lower() != "csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported export format: {format}. Supported: csv",
        )

    rows = (
        db.query(Analytics)
        .filter(Analytics.user_id == current_user.id)
        .order_by(Analytics.date.desc())
        .all()
    )

    return StreamingResponse(
        _generate_csv(rows),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=analytics_export.csv"},
    )
