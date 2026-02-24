"""
Celery Configuration for Amarktai Marketing
"""

from celery import Celery
from celery.signals import beat_init
from celery.schedules import crontab
from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "amarktai_marketing",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    result_expires=86400,  # Results expire after 24 hours
)

# ---------------------------------------------------------------------------
# Beat schedule – 3 content generation + posting windows per day
# ---------------------------------------------------------------------------
celery_app.conf.beat_schedule = {
    # Morning batch: 08:00 UTC – generate content for all users
    "morning-content-generation": {
        "task": "app.workers.tasks.run_content_generation_and_post",
        "schedule": crontab(hour=8, minute=0),
        "kwargs": {"window": "morning"},
    },
    # Midday batch: 13:00 UTC
    "midday-content-generation": {
        "task": "app.workers.tasks.run_content_generation_and_post",
        "schedule": crontab(hour=13, minute=0),
        "kwargs": {"window": "midday"},
    },
    # Evening batch: 18:00 UTC
    "evening-content-generation": {
        "task": "app.workers.tasks.run_content_generation_and_post",
        "schedule": crontab(hour=18, minute=0),
        "kwargs": {"window": "evening"},
    },

    # Sync platform analytics every 6 hours
    "sync-analytics": {
        "task": "app.workers.tasks.sync_platform_analytics",
        "schedule": crontab(hour="*/6", minute=0),
    },

    # Post any approved-but-not-yet-posted content every 15 minutes
    "post-scheduled-content": {
        "task": "app.workers.tasks.post_approved_content",
        "schedule": crontab(minute="*/15"),
    },

    # Analyse A/B tests daily at 03:00 UTC
    "analyze-ab-tests": {
        "task": "app.workers.tasks.analyze_ab_tests",
        "schedule": crontab(hour=3, minute=0),
    },
}


@beat_init.connect
def on_beat_init(sender, **kwargs):
    """Called when Celery beat starts."""
    print("🕐 Celery beat scheduler initialised")
    print("📅 Posting windows: 08:00, 13:00, 18:00 UTC (3×/day per user)")


@celery_app.task(bind=True)
def debug_task(self):
    """Debug task to verify Celery is working."""
    print(f"Request: {self.request!r}")
    return {"status": "ok"}


if __name__ == "__main__":
    celery_app.start()
