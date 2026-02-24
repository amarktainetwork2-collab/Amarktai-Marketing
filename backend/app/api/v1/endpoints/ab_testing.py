"""
A/B Testing Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.engagement import ABTest
from app.models.user import User

router = APIRouter()

# Schemas
class ABTestCreate(BaseModel):
    content_id: str
    test_name: str
    platform: str
    test_hypothesis: Optional[str] = None
    variants: List[dict]

class ABTestResponse(BaseModel):
    id: str
    test_name: str
    platform: str
    status: str
    variants: List[dict]
    winning_variant_id: Optional[str] = None
    confidence_level: Optional[float] = None
    improvement_percent: Optional[float] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime

class ABTestUpdate(BaseModel):
    status: Optional[str] = None
    winning_variant_id: Optional[str] = None
    confidence_level: Optional[float] = None
    improvement_percent: Optional[float] = None

@router.get("/tests", response_model=List[ABTestResponse])
async def get_ab_tests(
    status: Optional[str] = None,
    platform: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all A/B tests for the current user."""
    query = db.query(ABTest).filter(ABTest.user_id == current_user.id)
    
    if status:
        query = query.filter(ABTest.status == status)
    if platform:
        query = query.filter(ABTest.platform == platform)
    
    tests = query.order_by(ABTest.created_at.desc()).all()
    return tests

@router.post("/tests", status_code=status.HTTP_201_CREATED)
async def create_ab_test(
    test: ABTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new A/B test."""
    new_test = ABTest(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        content_id=test.content_id,
        webapp_id=test.content_id,  # Simplified - should get from content
        test_name=test.test_name,
        platform=test.platform,
        test_hypothesis=test.test_hypothesis,
        variants=test.variants,
        status="running",
        started_at=datetime.now(),
        variant_metrics={variant["variant_id"]: {
            "views": 0,
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "ctr": 0
        } for variant in test.variants}
    )
    
    db.add(new_test)
    db.commit()
    
    return {
        "id": new_test.id,
        "message": "A/B test created successfully",
        "status": "running"
    }

@router.get("/tests/{test_id}")
async def get_ab_test(
    test_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific A/B test with detailed metrics."""
    test = db.query(ABTest).filter(
        ABTest.id == test_id,
        ABTest.user_id == current_user.id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="A/B test not found")
    
    # Calculate current metrics
    variant_performance = []
    for variant in test.variants:
        metrics = test.variant_metrics.get(variant["variant_id"], {})
        
        # Calculate engagement rate
        views = metrics.get("views", 0)
        engagement = metrics.get("likes", 0) + metrics.get("comments", 0) + metrics.get("shares", 0)
        engagement_rate = (engagement / views * 100) if views > 0 else 0
        
        variant_performance.append({
            "variant_id": variant["variant_id"],
            "title": variant.get("title", ""),
            "metrics": metrics,
            "engagement_rate": round(engagement_rate, 2),
            "ctr": metrics.get("ctr", 0)
        })
    
    return {
        "test": test,
        "variant_performance": variant_performance,
        "days_running": (datetime.now() - test.started_at).days if test.started_at else 0
    }

@router.patch("/tests/{test_id}")
async def update_ab_test(
    test_id: str,
    update: ABTestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an A/B test (e.g., declare winner, end test)."""
    test = db.query(ABTest).filter(
        ABTest.id == test_id,
        ABTest.user_id == current_user.id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="A/B test not found")
    
    if update.status:
        test.status = update.status
        if update.status == "completed":
            test.ended_at = datetime.now()
    
    if update.winning_variant_id:
        test.winning_variant_id = update.winning_variant_id
    
    if update.confidence_level:
        test.confidence_level = str(update.confidence_level)
    
    if update.improvement_percent:
        test.improvement_percent = str(update.improvement_percent)
    
    db.commit()
    
    return {"message": "A/B test updated successfully"}

@router.post("/tests/{test_id}/analyze")
async def analyze_ab_test(
    test_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze A/B test results and recommend winner."""
    test = db.query(ABTest).filter(
        ABTest.id == test_id,
        ABTest.user_id == current_user.id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="A/B test not found")
    
    # Calculate winner based on engagement
    best_variant = None
    best_score = 0
    
    for variant in test.variants:
        metrics = test.variant_metrics.get(variant["variant_id"], {})
        
        # Composite score: views * 0.3 + likes * 0.3 + comments * 0.25 + shares * 0.15
        score = (
            metrics.get("views", 0) * 0.3 +
            metrics.get("likes", 0) * 0.3 +
            metrics.get("comments", 0) * 0.25 +
            metrics.get("shares", 0) * 0.15
        )
        
        if score > best_score:
            best_score = score
            best_variant = variant
    
    if best_variant:
        # Calculate improvement vs baseline (variant A)
        baseline_metrics = test.variant_metrics.get("A", {})
        baseline_score = (
            baseline_metrics.get("views", 0) * 0.3 +
            baseline_metrics.get("likes", 0) * 0.3 +
            baseline_metrics.get("comments", 0) * 0.25 +
            baseline_metrics.get("shares", 0) * 0.15
        )
        
        improvement = ((best_score - baseline_score) / baseline_score * 100) if baseline_score > 0 else 0
        
        return {
            "recommended_winner": best_variant["variant_id"],
            "winner_title": best_variant.get("title", ""),
            "improvement_percent": round(improvement, 2),
            "confidence_estimate": "high" if improvement > 20 else "medium" if improvement > 10 else "low",
            "recommendation": f"Variant {best_variant['variant_id']} is performing {improvement:.1f}% better than the baseline."
        }
    
    return {"message": "Not enough data to determine winner"}

@router.get("/stats")
async def get_ab_testing_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get A/B testing statistics."""
    from sqlalchemy import func
    
    # Total tests
    total_tests = db.query(ABTest).filter(
        ABTest.user_id == current_user.id
    ).count()
    
    # Tests by status
    status_counts = db.query(
        ABTest.status,
        func.count(ABTest.id).label("count")
    ).filter(
        ABTest.user_id == current_user.id
    ).group_by(ABTest.status).all()
    
    # Tests by platform
    platform_counts = db.query(
        ABTest.platform,
        func.count(ABTest.id).label("count")
    ).filter(
        ABTest.user_id == current_user.id
    ).group_by(ABTest.platform).all()
    
    # Completed tests with winners
    completed_with_winner = db.query(ABTest).filter(
        ABTest.user_id == current_user.id,
        ABTest.status == "completed",
        ABTest.winning_variant_id.isnot(None)
    ).count()
    
    return {
        "total_tests": total_tests,
        "by_status": {s.status: s.count for s in status_counts},
        "by_platform": {p.platform: p.count for p in platform_counts},
        "completed_with_winner": completed_with_winner,
        "win_rate": round(completed_with_winner / max(total_tests, 1) * 100, 2)
    }
