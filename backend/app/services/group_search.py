"""
Group / Community Search Service

Searches social platforms for relevant groups or communities based on
keywords extracted from a webapp's scraped content.

Supported platforms:
  - Facebook  – /search?type=group via Graph API
  - Reddit    – subreddits via public JSON API (no auth required)
  - Telegram  – manual input only (no public search API)
  - Discord   – webhook/server input only (no public search API)

Returns a list of GroupSuggestion dataclasses ready to be stored as
BusinessGroup rows with status=SUGGESTED.

Design notes:
  * No automated joining – users receive join links and add the group_id
    manually after joining.
  * Rate-limited: max 10 suggestions per platform per search.
  * All HTTP calls use httpx async client.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import httpx


@dataclass
class GroupSuggestion:
    platform: str
    group_id: str
    group_name: str
    group_url: str
    description: str = ""
    member_count: int = 0
    keywords_used: str = ""


# ---------------------------------------------------------------------------
# Facebook group search (requires a Page/App access token)
# ---------------------------------------------------------------------------

async def search_facebook_groups(
    access_token: str,
    keywords: str,
    limit: int = 10,
) -> list[GroupSuggestion]:
    """Search for Facebook groups matching the given keywords."""
    results: list[GroupSuggestion] = []
    try:
        url = "https://graph.facebook.com/v18.0/search"
        params = {
            "q": keywords,
            "type": "group",
            "fields": "id,name,description,member_count",
            "limit": limit,
            "access_token": access_token,
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        for item in data.get("data", []):
            results.append(GroupSuggestion(
                platform="facebook",
                group_id=item.get("id", ""),
                group_name=item.get("name", ""),
                group_url=f"https://www.facebook.com/groups/{item.get('id', '')}",
                description=item.get("description", "")[:300],
                member_count=item.get("member_count", 0),
                keywords_used=keywords,
            ))
    except Exception:
        pass
    return results


# ---------------------------------------------------------------------------
# Reddit subreddit search (public JSON API – no auth needed)
# ---------------------------------------------------------------------------

async def search_reddit_subreddits(
    keywords: str,
    limit: int = 10,
) -> list[GroupSuggestion]:
    """Search Reddit subreddits matching the given keywords."""
    results: list[GroupSuggestion] = []
    try:
        url = "https://www.reddit.com/subreddits/search.json"
        headers = {"User-Agent": "AmarktAIBot/1.0 (organic marketing tool)"}
        params = {"q": keywords, "limit": limit, "include_over_18": "false"}
        async with httpx.AsyncClient(timeout=15, headers=headers) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        for child in data.get("data", {}).get("children", []):
            sub = child.get("data", {})
            name = sub.get("display_name", "")
            results.append(GroupSuggestion(
                platform="reddit",
                group_id=name,
                group_name=f"r/{name}",
                group_url=f"https://www.reddit.com/r/{name}/",
                description=(sub.get("public_description") or sub.get("title") or "")[:300],
                member_count=sub.get("subscribers", 0),
                keywords_used=keywords,
            ))
    except Exception:
        pass
    return results


# ---------------------------------------------------------------------------
# Telegram – no public search API; return placeholder for manual input
# ---------------------------------------------------------------------------

def suggest_telegram_manual() -> list[GroupSuggestion]:
    """
    Telegram has no public group-search API.
    Return a single placeholder so the UI can prompt the user to
    manually find and enter a channel/group ID.
    """
    return [GroupSuggestion(
        platform="telegram",
        group_id="",
        group_name="Add Telegram Group/Channel",
        group_url="https://t.me/",
        description=(
            "Telegram has no public search API. "
            "Search for relevant groups manually on Telegram, join them, "
            "then enter the chat ID (e.g. @channelname or -100xxxxxxx) here."
        ),
        keywords_used="",
    )]


# ---------------------------------------------------------------------------
# Discord – no public guild-search API; return placeholder for manual input
# ---------------------------------------------------------------------------

def suggest_discord_manual() -> list[GroupSuggestion]:
    """
    Discord has no public server-search API for bots.
    Return a placeholder so the UI can prompt the user for a webhook URL.
    """
    return [GroupSuggestion(
        platform="discord",
        group_id="",
        group_name="Add Discord Server Webhook",
        group_url="https://discord.com/",
        description=(
            "Discord has no public server-search API. "
            "In your Discord server go to Channel Settings → Integrations → Webhooks "
            "and paste the webhook URL here to enable posting."
        ),
        keywords_used="",
    )]


# ---------------------------------------------------------------------------
# Master search function
# ---------------------------------------------------------------------------

async def search_groups_for_webapp(
    platform: str,
    keywords: str,
    facebook_token: str | None = None,
    limit: int = 10,
) -> list[GroupSuggestion]:
    """
    Search for groups on the given platform using the provided keywords.

    Args:
        platform:        One of 'facebook', 'reddit', 'telegram', 'discord'
        keywords:        Search query (usually generated from scraped webapp content)
        facebook_token:  User Facebook access token (required for Facebook search)
        limit:           Max results to return

    Returns:
        List of GroupSuggestion objects
    """
    if platform == "facebook":
        if not facebook_token:
            return []
        return await search_facebook_groups(facebook_token, keywords, limit)
    elif platform == "reddit":
        return await search_reddit_subreddits(keywords, limit)
    elif platform == "telegram":
        return suggest_telegram_manual()
    elif platform == "discord":
        return suggest_discord_manual()
    else:
        return []


def extract_keywords_from_scraped(scraped_data: dict | None, webapp_name: str = "") -> str:
    """
    Build a search keyword string from scraped website data.

    Falls back to webapp_name + category if no scrape data is available.
    """
    if not scraped_data:
        return webapp_name

    parts: list[str] = []

    # Use headings if available
    headings = scraped_data.get("headings", [])
    if headings:
        parts.extend(headings[:3])

    # Use meta description
    meta = scraped_data.get("meta_description", "")
    if meta:
        parts.append(meta[:80])

    # Fall back to full_text snippet
    if not parts:
        full = scraped_data.get("full_text", "")
        if full:
            parts.append(full[:100])

    query = " ".join(parts).strip()
    return query or webapp_name
