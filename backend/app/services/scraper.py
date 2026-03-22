"""
Web scraper for the Competitor Shadow Analyzer.

Fetches public web pages and extracts meaningful text content,
social links, headings, and meta descriptions using BeautifulSoup.
Runs over httpx so it is compatible with async FastAPI handlers.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

import httpx
from bs4 import BeautifulSoup


@dataclass
class ScrapedPage:
    url: str
    title: str = ""
    meta_description: str = ""
    headings: list[str] = field(default_factory=list)
    paragraphs: list[str] = field(default_factory=list)
    links: list[str] = field(default_factory=list)
    social_links: list[str] = field(default_factory=list)
    full_text: str = ""
    error: str | None = None


_SOCIAL_DOMAINS = {"twitter.com", "x.com", "instagram.com", "facebook.com",
                   "linkedin.com", "tiktok.com", "youtube.com", "pinterest.com"}

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; AmarktAIBot/1.0; "
        "+https://amarktai.com/bot)"
    ),
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}


async def scrape_page(url: str, timeout: int = 20) -> ScrapedPage:
    """
    Fetch and parse a public web page.

    Returns a ScrapedPage with the useful textual content.
    """
    result = ScrapedPage(url=url)
    try:
        async with httpx.AsyncClient(
            headers=_HEADERS,
            timeout=timeout,
            follow_redirects=True,
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text
    except Exception as exc:
        result.error = str(exc)
        return result

    soup = BeautifulSoup(html, "html.parser")

    # Remove noise
    for tag in soup(["script", "style", "nav", "footer", "noscript", "aside", "form"]):
        tag.decompose()

    # Title
    title_tag = soup.find("title")
    result.title = title_tag.get_text(strip=True) if title_tag else ""

    # Meta description
    meta = soup.find("meta", attrs={"name": re.compile("^description$", re.I)})
    if meta and meta.get("content"):  # type: ignore[union-attr]
        result.meta_description = meta["content"]  # type: ignore[index]

    # Headings (h1–h3)
    for h in soup.find_all(["h1", "h2", "h3"]):
        text = h.get_text(strip=True)
        if text and len(text) > 3:
            result.headings.append(text)

    # Paragraphs
    for p in soup.find_all("p"):
        text = p.get_text(strip=True)
        if len(text) > 40:
            result.paragraphs.append(text)

    # Links – separate social links from regular
    for a in soup.find_all("a", href=True):
        href: str = a["href"]
        if href.startswith("http"):
            domain = href.split("/")[2].lower().lstrip("www.")
            if any(s in domain for s in _SOCIAL_DOMAINS):
                result.social_links.append(href)
            else:
                result.links.append(href)

    # Full text (for HF models)
    texts = [result.title, result.meta_description] + result.headings + result.paragraphs
    result.full_text = " ".join(texts)[:4000]

    return result


async def scrape_multiple(urls: list[str]) -> list[ScrapedPage]:
    """Scrape multiple pages, returning results in order."""
    import asyncio

    tasks = [scrape_page(url) for url in urls]
    return await asyncio.gather(*tasks)
