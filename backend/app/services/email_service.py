"""
Email service — send transactional emails via Resend.

Templates:
- welcome        — sent after user registration
- contact_ack    — sent to user after submitting contact form
- contact_fwd    — forwarded contact submission to admin
- content_posted — notification when content is published
- weekly_digest  — optional weekly analytics summary

All sends degrade gracefully if RESEND_API_KEY is not configured.
"""

from __future__ import annotations

import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


def _resend_configured() -> bool:
    return bool(settings.RESEND_API_KEY)


def _send(to: str | list[str], subject: str, html: str) -> bool:
    """Send an email via Resend. Returns True on success."""
    if not _resend_configured():
        logger.debug("Email skipped (RESEND_API_KEY not set): %s → %s", subject, to)
        return False
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": [to] if isinstance(to, str) else to,
            "subject": subject,
            "html": html,
        })
        logger.info("Email sent: %s → %s", subject, to)
        return True
    except Exception as e:
        logger.error("Email send failed: %s — %s", subject, e)
        return False


# ── Templates ─────────────────────────────────────────────────────────────────

def send_welcome(email: str, name: str | None = None) -> bool:
    """Send welcome email after registration."""
    display = name or email.split("@")[0]
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h1 style="color:#2563FF;">Welcome to AmarktAI Marketing!</h1>
      <p>Hi {display},</p>
      <p>Thanks for signing up. You're all set to start generating AI-powered social media content.</p>
      <h3>Quick Start:</h3>
      <ol>
        <li>Add your first web app / business</li>
        <li>Connect your social platforms</li>
        <li>Generate content with one click</li>
      </ol>
      <p><a href="{settings.FRONTEND_URL}/dashboard" style="background:#2563FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Go to Dashboard</a></p>
      <p style="color:#888;font-size:12px;margin-top:30px;">— AmarktAI Marketing</p>
    </div>
    """
    return _send(email, "Welcome to AmarktAI Marketing 🚀", html)


def send_contact_acknowledgement(email: str, name: str) -> bool:
    """Send acknowledgement to user who submitted contact form."""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#2563FF;">Thanks for reaching out!</h2>
      <p>Hi {name},</p>
      <p>We received your message and will get back to you within 24 hours.</p>
      <p style="color:#888;font-size:12px;margin-top:30px;">— AmarktAI Marketing Team</p>
    </div>
    """
    return _send(email, "We received your message — AmarktAI Marketing", html)


def send_contact_forward(name: str, email: str, subject: str, message: str) -> bool:
    """Forward contact form submission to the admin/support email."""
    admin_email = settings.CONTACT_EMAIL or settings.ADMIN_EMAIL
    if not admin_email:
        logger.warning("Contact form forward skipped — no CONTACT_EMAIL or ADMIN_EMAIL configured")
        return False
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> {name} &lt;{email}&gt;</p>
      <p><strong>Subject:</strong> {subject}</p>
      <hr>
      <p>{message}</p>
      <hr>
      <p style="color:#888;font-size:12px;">Reply directly to this email to respond to {name}.</p>
    </div>
    """
    return _send(admin_email, f"[Contact] {subject} — from {name}", html)


def send_content_posted(email: str, platform: str, title: str, url: str | None = None) -> bool:
    """Notify user when content has been posted to a platform."""
    link_html = f'<p><a href="{url}" style="color:#2563FF;">View Post →</a></p>' if url else ""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#2563FF;">Content Posted! ✅</h2>
      <p>Your content has been published:</p>
      <p><strong>Platform:</strong> {platform.title()}</p>
      <p><strong>Title:</strong> {title}</p>
      {link_html}
      <p><a href="{settings.FRONTEND_URL}/dashboard/analytics" style="color:#2563FF;">View Analytics →</a></p>
      <p style="color:#888;font-size:12px;margin-top:30px;">— AmarktAI Marketing</p>
    </div>
    """
    return _send(email, f"Posted to {platform.title()} — {title}", html)


def send_weekly_digest(
    email: str,
    name: str | None,
    stats: dict[str, Any],
) -> bool:
    """Send weekly analytics digest."""
    display = name or email.split("@")[0]
    posts = stats.get("total_posts", 0)
    views = stats.get("total_views", 0)
    engagement_rate = stats.get("avg_engagement_rate", 0)

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#2563FF;">Your Weekly Digest 📊</h2>
      <p>Hi {display}, here's your week in review:</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr style="background:#f8f9fa;">
          <td style="padding:12px;border:1px solid #e5e7eb;"><strong>Posts Published</strong></td>
          <td style="padding:12px;border:1px solid #e5e7eb;text-align:right;">{posts}</td>
        </tr>
        <tr>
          <td style="padding:12px;border:1px solid #e5e7eb;"><strong>Total Views</strong></td>
          <td style="padding:12px;border:1px solid #e5e7eb;text-align:right;">{views:,}</td>
        </tr>
        <tr style="background:#f8f9fa;">
          <td style="padding:12px;border:1px solid #e5e7eb;"><strong>Avg Engagement</strong></td>
          <td style="padding:12px;border:1px solid #e5e7eb;text-align:right;">{engagement_rate:.1f}%</td>
        </tr>
      </table>
      <p><a href="{settings.FRONTEND_URL}/dashboard/analytics" style="background:#2563FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View Full Analytics</a></p>
      <p style="color:#888;font-size:12px;margin-top:30px;">— AmarktAI Marketing</p>
    </div>
    """
    return _send(email, "Your Weekly Marketing Digest — AmarktAI", html)
