"""
Celery Configuration for AmarktAI Marketing
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

    # Nightly competitor refresh at 02:00 UTC
    "daily-competitor-refresh": {
        "task": "app.workers.tasks.daily_competitor_refresh",
        "schedule": crontab(hour=2, minute=0),
    },

    # Daily Viral Spark report at 07:00 UTC (before morning posts)
    "daily-viral-spark": {
        "task": "app.workers.tasks.daily_viral_spark",
        "schedule": crontab(hour=7, minute=0),
    },

    # Nightly churn check at 01:00 UTC
    "daily-churn-check": {
        "task": "app.workers.tasks.daily_churn_check",
        "schedule": crontab(hour=1, minute=0),
    },

    # Feedback Alchemy at 04:00 UTC (after analytics sync)
    "daily-feedback-alchemy": {
        "task": "app.workers.tasks.daily_feedback_alchemy",
        "schedule": crontab(hour=4, minute=0),
    },

    # SEO Mirage for yesterday's posts at 05:00 UTC
    "daily-seo-mirage": {
        "task": "app.workers.tasks.daily_seo_mirage",
        "schedule": crontab(hour=5, minute=0),
    },

    # Auto-repurpose top content at 06:00 UTC (before morning posts)
    "auto-repurpose-top-content": {
        "task": "app.workers.tasks.auto_repurpose_top_content",
        "schedule": crontab(hour=6, minute=0),
    },

    # Harmony Pricer at 09:00 UTC
    "daily-harmony-pricer": {
        "task": "app.workers.tasks.daily_harmony_pricer",
        "schedule": crontab(hour=9, minute=0),
    },

    # Echo Amplifier at 10:00 UTC
    "daily-echo-amplifier": {
        "task": "app.workers.tasks.daily_echo_amplifier",
        "schedule": crontab(hour=10, minute=0),
    },

    # Audience Mapper at 14:00 UTC
    "daily-audience-mapper": {
        "task": "app.workers.tasks.daily_audience_mapper",
        "schedule": crontab(hour=14, minute=0),
    },

    # Ad Alchemy at 15:00 UTC
    "daily-ad-alchemy": {
        "task": "app.workers.tasks.daily_ad_alchemy",
        "schedule": crontab(hour=15, minute=0),
    },

    # Comment-to-lead scan every 2 hours
    "poll-comment-leads": {
        "task": "app.workers.tasks.poll_and_capture_comment_leads",
        "schedule": crontab(minute=0, hour="*/2"),
    },

    # Weekly group search – Sunday at 03:30 UTC (fresh suggestions each week)
    "weekly-group-search": {
        "task": "app.workers.tasks.search_and_suggest_groups",
        "schedule": crontab(hour=3, minute=30, day_of_week=0),
    },

    # Post to active groups 3× daily (offset from main content posts)
    "morning-group-posts": {
        "task": "app.workers.tasks.post_to_active_groups",
        "schedule": crontab(hour=8, minute=30),
    },
    "midday-group-posts": {
        "task": "app.workers.tasks.post_to_active_groups",
        "schedule": crontab(hour=13, minute=30),
    },
    "evening-group-posts": {
        "task": "app.workers.tasks.post_to_active_groups",
        "schedule": crontab(hour=18, minute=30),
    },

    # Nightly scrape refresh – re-scrape all webapp URLs at 00:30 UTC
    "nightly-scrape-refresh": {
        "task": "app.workers.tasks.refresh_all_webapp_scrapes",
        "schedule": crontab(hour=0, minute=30),
    },

    # Weekly digest email – Monday at 09:00 UTC
    "weekly-digest-email": {
        "task": "app.workers.tasks.send_weekly_digest_emails",
        "schedule": crontab(hour=9, minute=0, day_of_week=1),
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
