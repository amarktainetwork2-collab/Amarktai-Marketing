"""Public changelog endpoint — no authentication required."""

from fastapi import APIRouter

router = APIRouter()

_CHANGELOG = [
    {
        "date": "2026-04-09",
        "title": "Launch!",
        "description": (
            "AmarktAI Marketing goes live with 12+ platform support, "
            "AI content generation, and Stripe billing."
        ),
    },
    {
        "date": "2026-04-08",
        "title": "Security hardening",
        "description": (
            "Added rate limiting, OAuth PKCE, HTTPS with HSTS, "
            "and email verification."
        ),
    },
    {
        "date": "2026-04-07",
        "title": "Blog & Analytics",
        "description": (
            "SEO blog generator, CSV analytics export, and usage quotas."
        ),
    },
]


@router.get("/")
def get_changelog() -> list[dict]:
    """Return the public product changelog."""
    return _CHANGELOG
