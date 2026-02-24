"""
Platform Posting Service for Amarktai Marketing.

Implements real API calls to post content on all 6 supported platforms:
  - Twitter/X (tweepy v2)
  - Facebook (Graph API)
  - Instagram (Graph API – image + Reels)
  - LinkedIn (UGC Posts API)
  - TikTok (Content Posting API v2)
  - YouTube (Data API v3 – Shorts upload)

Each platform returns a PostResult(success, post_id, url, error).
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any

import httpx

# --------------------------------------------------------------------------- #
# Result type
# --------------------------------------------------------------------------- #

@dataclass
class PostResult:
    success: bool
    post_id: str | None = None
    url: str | None = None
    error: str | None = None


# --------------------------------------------------------------------------- #
# Twitter / X
# --------------------------------------------------------------------------- #

async def post_twitter(
    access_token: str,
    access_token_secret: str,
    api_key: str,
    api_secret: str,
    text: str,
    media_urls: list[str] | None = None,
) -> PostResult:
    """
    Post a tweet using Twitter API v2.
    Supports plain text.  Image upload requires v1.1 which needs OAuth1 – we
    include that path when tweepy is available.
    """
    try:
        import tweepy  # type: ignore

        client = tweepy.Client(
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_token_secret,
        )

        media_ids: list[str] = []
        if media_urls:
            # Upload images via v1.1
            auth = tweepy.OAuth1UserHandler(
                api_key, api_secret, access_token, access_token_secret
            )
            api_v1 = tweepy.API(auth)
            for url in media_urls[:4]:
                # Download image to temp file
                import tempfile
                async with httpx.AsyncClient(timeout=30) as hc:
                    img_resp = await hc.get(url)
                    img_resp.raise_for_status()
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    tmp.write(img_resp.content)
                    tmp_path = tmp.name
                upload = api_v1.media_upload(tmp_path)
                media_ids.append(str(upload.media_id))
                os.unlink(tmp_path)

        response = client.create_tweet(
            text=text[:280],
            media_ids=media_ids or None,
        )
        tweet_id = str(response.data["id"])
        return PostResult(
            success=True,
            post_id=tweet_id,
            url=f"https://x.com/i/web/status/{tweet_id}",
        )
    except ImportError:
        return PostResult(success=False, error="tweepy not installed")
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# Facebook
# --------------------------------------------------------------------------- #

async def post_facebook(
    page_access_token: str,
    page_id: str,
    message: str,
    media_urls: list[str] | None = None,
    link: str | None = None,
) -> PostResult:
    """Post to a Facebook Page feed (text, photo, or link)."""
    try:
        base = "https://graph.facebook.com/v18.0"
        headers = {"Authorization": f"Bearer {page_access_token}"}

        if media_urls:
            # Photo post
            payload: dict[str, Any] = {
                "caption": message,
                "url": media_urls[0],
                "access_token": page_access_token,
            }
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{base}/{page_id}/photos", data=payload, headers=headers
                )
                resp.raise_for_status()
                post_id = resp.json().get("post_id") or resp.json().get("id")
        else:
            payload = {"message": message, "access_token": page_access_token}
            if link:
                payload["link"] = link
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{base}/{page_id}/feed", data=payload, headers=headers
                )
                resp.raise_for_status()
                post_id = resp.json().get("id")

        return PostResult(
            success=True,
            post_id=str(post_id),
            url=f"https://www.facebook.com/{post_id}",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# Instagram
# --------------------------------------------------------------------------- #

async def post_instagram(
    access_token: str,
    ig_user_id: str,
    caption: str,
    image_url: str | None = None,
    video_url: str | None = None,
) -> PostResult:
    """
    Post to Instagram via Graph API.
    Supports single image posts and Reels (video).
    """
    try:
        base = "https://graph.facebook.com/v18.0"

        # Step 1 – create media container
        if video_url:
            container_params = {
                "media_type": "REELS",
                "video_url": video_url,
                "caption": caption,
                "share_to_feed": "true",
                "access_token": access_token,
            }
        elif image_url:
            container_params = {
                "image_url": image_url,
                "caption": caption,
                "access_token": access_token,
            }
        else:
            return PostResult(success=False, error="No media URL provided for Instagram post")

        async with httpx.AsyncClient(timeout=60) as client:
            r1 = await client.post(
                f"{base}/{ig_user_id}/media", data=container_params
            )
            r1.raise_for_status()
            container_id = r1.json().get("id")

            # Step 2 – publish
            r2 = await client.post(
                f"{base}/{ig_user_id}/media_publish",
                data={"creation_id": container_id, "access_token": access_token},
            )
            r2.raise_for_status()
            media_id = r2.json().get("id")

        return PostResult(
            success=True,
            post_id=str(media_id),
            url=f"https://www.instagram.com/p/{media_id}/",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# LinkedIn
# --------------------------------------------------------------------------- #

async def post_linkedin(
    access_token: str,
    person_urn: str,
    text: str,
    image_url: str | None = None,
    url: str | None = None,
) -> PostResult:
    """Post to LinkedIn using the UGC Posts API."""
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }

        share_content: dict[str, Any] = {
            "shareCommentary": {"text": text},
            "shareMediaCategory": "NONE",
        }

        if url:
            share_content["shareMediaCategory"] = "ARTICLE"
            share_content["media"] = [
                {
                    "status": "READY",
                    "originalUrl": url,
                    "title": {"text": text[:70]},
                }
            ]
        elif image_url:
            share_content["shareMediaCategory"] = "IMAGE"
            share_content["media"] = [
                {
                    "status": "READY",
                    "media": image_url,
                    "description": {"text": text[:200]},
                }
            ]

        body = {
            "author": person_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": share_content
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            },
        }

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.linkedin.com/v2/ugcPosts",
                json=body,
                headers=headers,
            )
            resp.raise_for_status()
            post_id = resp.headers.get("x-restli-id") or resp.json().get("id", "")

        return PostResult(
            success=True,
            post_id=str(post_id),
            url=f"https://www.linkedin.com/feed/update/{post_id}/",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# TikTok
# --------------------------------------------------------------------------- #

async def post_tiktok(
    access_token: str,
    video_url: str,
    title: str,
    privacy: str = "PUBLIC_TO_EVERYONE",
) -> PostResult:
    """
    Post a video to TikTok using the Content Posting API v2.
    Requires the ``video.upload`` scope.
    """
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json; charset=UTF-8",
        }

        # Pull from URL
        body = {
            "post_info": {
                "title": title[:150],
                "privacy_level": privacy,
                "disable_duet": False,
                "disable_comment": False,
                "disable_stitch": False,
            },
            "source_info": {
                "source": "PULL_FROM_URL",
                "video_url": video_url,
            },
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://open.tiktokapis.com/v2/post/publish/video/init/",
                json=body,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            publish_id = data.get("publish_id", "")

        return PostResult(
            success=True,
            post_id=str(publish_id),
            url="https://www.tiktok.com/",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# YouTube Shorts
# --------------------------------------------------------------------------- #

async def post_youtube(
    access_token: str,
    video_url: str,
    title: str,
    description: str,
    hashtags: list[str] | None = None,
) -> PostResult:
    """
    Upload a YouTube Short by downloading the video and uploading via
    resumable upload to the YouTube Data API v3.
    """
    try:
        # Download the video
        async with httpx.AsyncClient(timeout=120) as client:
            video_resp = await client.get(video_url)
            video_resp.raise_for_status()
            video_bytes = video_resp.content

        tags = (hashtags or []) + ["Shorts"]
        full_description = (
            description
            + "\n\n#Shorts"
            + "".join(f" #{t}" for t in (hashtags or [])[:5])
            + "\n\nDesigned and created by Amarktai Network"
        )

        metadata = {
            "snippet": {
                "title": (title + " #Shorts")[:100],
                "description": full_description[:5000],
                "tags": tags[:10],
                "categoryId": "22",
            },
            "status": {
                "privacyStatus": "public",
                "selfDeclaredMadeForKids": False,
            },
        }

        headers = {"Authorization": f"Bearer {access_token}"}

        # Initiate resumable upload
        async with httpx.AsyncClient(timeout=30) as client:
            init_resp = await client.post(
                "https://www.googleapis.com/upload/youtube/v3/videos"
                "?uploadType=resumable&part=snippet,status",
                json=metadata,
                headers={
                    **headers,
                    "Content-Type": "application/json; charset=UTF-8",
                    "X-Upload-Content-Type": "video/mp4",
                    "X-Upload-Content-Length": str(len(video_bytes)),
                },
            )
            init_resp.raise_for_status()
            upload_url = init_resp.headers["Location"]

            # Upload video bytes
            upload_resp = await client.put(
                upload_url,
                content=video_bytes,
                headers={**headers, "Content-Type": "video/mp4"},
            )
            upload_resp.raise_for_status()
            video_id = upload_resp.json().get("id", "")

        return PostResult(
            success=True,
            post_id=video_id,
            url=f"https://youtube.com/shorts/{video_id}",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# Dispatcher
# --------------------------------------------------------------------------- #

async def post_to_platform(
    platform: str,
    credentials: dict[str, str],
    caption: str,
    title: str,
    hashtags: list[str],
    media_urls: list[str],
    webapp_url: str = "",
) -> PostResult:
    """
    Unified dispatcher.  ``credentials`` keys depend on the platform:

    twitter:   access_token, access_token_secret, api_key, api_secret
    facebook:  page_access_token, page_id
    instagram: access_token, ig_user_id
    linkedin:  access_token, person_urn
    tiktok:    access_token
    youtube:   access_token
    pinterest: access_token, board_id
    reddit:    access_token, subreddit
    bluesky:   identifier, app_password
    threads:   access_token, threads_user_id
    telegram:  bot_token, chat_id
    snapchat:  access_token, ad_account_id
    """
    hashtag_text = " ".join(f"#{h}" for h in hashtags)
    full_caption = f"{caption}\n\n{hashtag_text}".strip()

    try:
        if platform == "twitter":
            return await post_twitter(
                access_token=credentials["access_token"],
                access_token_secret=credentials["access_token_secret"],
                api_key=credentials["api_key"],
                api_secret=credentials["api_secret"],
                text=full_caption,
                media_urls=media_urls or None,
            )

        if platform == "facebook":
            return await post_facebook(
                page_access_token=credentials["page_access_token"],
                page_id=credentials["page_id"],
                message=full_caption,
                media_urls=media_urls or None,
                link=webapp_url or None,
            )

        if platform == "instagram":
            image_url = media_urls[0] if media_urls else None
            if not image_url:
                return PostResult(success=False, error="Instagram requires an image URL")
            return await post_instagram(
                access_token=credentials["access_token"],
                ig_user_id=credentials["ig_user_id"],
                caption=full_caption,
                image_url=image_url,
            )

        if platform == "linkedin":
            return await post_linkedin(
                access_token=credentials["access_token"],
                person_urn=credentials["person_urn"],
                text=full_caption,
                image_url=media_urls[0] if media_urls else None,
                url=webapp_url or None,
            )

        if platform == "tiktok":
            video_url = media_urls[0] if media_urls else None
            if not video_url:
                return PostResult(success=False, error="TikTok requires a video URL")
            return await post_tiktok(
                access_token=credentials["access_token"],
                video_url=video_url,
                title=title,
            )

        if platform == "youtube":
            video_url = media_urls[0] if media_urls else None
            if not video_url:
                return PostResult(success=False, error="YouTube requires a video URL")
            return await post_youtube(
                access_token=credentials["access_token"],
                video_url=video_url,
                title=title,
                description=full_caption,
                hashtags=hashtags,
            )

        if platform == "pinterest":
            return await post_pinterest(
                access_token=credentials["access_token"],
                board_id=credentials["board_id"],
                title=title,
                description=full_caption,
                image_url=media_urls[0] if media_urls else None,
                link=webapp_url or None,
            )

        if platform == "reddit":
            return await post_reddit(
                access_token=credentials["access_token"],
                subreddit=credentials["subreddit"],
                title=title,
                text=full_caption,
                link=webapp_url or None,
            )

        if platform == "bluesky":
            return await post_bluesky(
                identifier=credentials["identifier"],
                app_password=credentials["app_password"],
                text=full_caption,
                image_url=media_urls[0] if media_urls else None,
            )

        if platform == "threads":
            return await post_threads(
                access_token=credentials["access_token"],
                threads_user_id=credentials["threads_user_id"],
                text=full_caption,
                image_url=media_urls[0] if media_urls else None,
            )

        if platform == "telegram":
            return await post_telegram(
                bot_token=credentials["bot_token"],
                chat_id=credentials["chat_id"],
                text=full_caption,
                image_url=media_urls[0] if media_urls else None,
            )

        if platform == "snapchat":
            media_url = media_urls[0] if media_urls else None
            if not media_url:
                return PostResult(success=False, error="Snapchat requires a media URL")
            return await post_snapchat(
                access_token=credentials["access_token"],
                ad_account_id=credentials["ad_account_id"],
                title=title,
                media_url=media_url,
            )

        return PostResult(success=False, error=f"Unknown platform: {platform}")

    except KeyError as exc:
        return PostResult(
            success=False,
            error=f"Missing credential for {platform}: {exc}",
        )


# --------------------------------------------------------------------------- #
# Pinterest
# --------------------------------------------------------------------------- #

async def post_pinterest(
    access_token: str,
    board_id: str,
    title: str,
    description: str,
    image_url: str | None = None,
    link: str | None = None,
) -> PostResult:
    """Create a Pin on Pinterest using the Pinterest API v5."""
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }
        body: dict[str, Any] = {
            "board_id": board_id,
            "title": title[:100],
            "description": description[:500],
        }
        if link:
            body["link"] = link
        if image_url:
            body["media_source"] = {"source_type": "image_url", "url": image_url}

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.pinterest.com/v5/pins",
                json=body,
                headers=headers,
            )
            resp.raise_for_status()
            pin_id = resp.json().get("id", "")

        return PostResult(
            success=True,
            post_id=str(pin_id),
            url=f"https://www.pinterest.com/pin/{pin_id}/",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# Reddit
# --------------------------------------------------------------------------- #

async def post_reddit(
    access_token: str,
    subreddit: str,
    title: str,
    text: str,
    link: str | None = None,
) -> PostResult:
    """Submit a post to a subreddit using the Reddit OAuth2 API."""
    try:
        headers = {
            "Authorization": f"bearer {access_token}",
            "User-Agent": "AmarktaiBot/1.0",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        if link:
            data = {
                "kind": "link",
                "sr": subreddit.lstrip("r/"),
                "title": title[:300],
                "url": link,
                "resubmit": "true",
            }
        else:
            data = {
                "kind": "self",
                "sr": subreddit.lstrip("r/"),
                "title": title[:300],
                "text": text[:40000],
            }

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://oauth.reddit.com/api/submit",
                data=data,
                headers=headers,
            )
            resp.raise_for_status()
            resp_json = resp.json()
            post_id = resp_json.get("data", {}).get("id", "")
            post_url = resp_json.get("data", {}).get("url", "")

        return PostResult(
            success=True,
            post_id=str(post_id),
            url=post_url or f"https://www.reddit.com/r/{subreddit}/",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# Bluesky (AT Protocol)
# --------------------------------------------------------------------------- #

async def post_bluesky(
    identifier: str,
    app_password: str,
    text: str,
    image_url: str | None = None,
) -> PostResult:
    """Post to Bluesky via the AT Protocol HTTP API."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Authenticate
            auth_resp = await client.post(
                "https://bsky.social/xrpc/com.atproto.server.createSession",
                json={"identifier": identifier, "password": app_password},
            )
            auth_resp.raise_for_status()
            session = auth_resp.json()
            access_jwt = session["accessJwt"]
            did = session["did"]

            headers = {"Authorization": f"Bearer {access_jwt}"}

            post_body: dict[str, Any] = {
                "$type": "app.bsky.feed.post",
                "text": text[:300],
                "createdAt": json.dumps(None).replace("null", "") or
                    __import__("datetime").datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            }
            import datetime as _dt
            post_body["createdAt"] = _dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")

            # Upload image blob if provided
            if image_url:
                img_resp = await client.get(image_url)
                if img_resp.is_success:
                    blob_resp = await client.post(
                        "https://bsky.social/xrpc/com.atproto.repo.uploadBlob",
                        content=img_resp.content,
                        headers={**headers, "Content-Type": "image/jpeg"},
                    )
                    if blob_resp.is_success:
                        blob = blob_resp.json().get("blob", {})
                        post_body["embed"] = {
                            "$type": "app.bsky.embed.images",
                            "images": [{"image": blob, "alt": text[:300]}],
                        }

            create_resp = await client.post(
                "https://bsky.social/xrpc/com.atproto.repo.createRecord",
                json={
                    "repo": did,
                    "collection": "app.bsky.feed.post",
                    "record": post_body,
                },
                headers=headers,
            )
            create_resp.raise_for_status()
            uri = create_resp.json().get("uri", "")
            rkey = uri.split("/")[-1] if uri else ""

        return PostResult(
            success=True,
            post_id=uri,
            url=f"https://bsky.app/profile/{identifier}/post/{rkey}",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# Threads (Meta)
# --------------------------------------------------------------------------- #

async def post_threads(
    access_token: str,
    threads_user_id: str,
    text: str,
    image_url: str | None = None,
) -> PostResult:
    """Post to Threads via the Threads API (Meta Graph API)."""
    try:
        base = "https://graph.threads.net/v1.0"

        # Step 1 – create media container
        container_params: dict[str, Any] = {
            "text": text[:500],
            "access_token": access_token,
        }
        if image_url:
            container_params["image_url"] = image_url
            container_params["media_type"] = "IMAGE"
        else:
            container_params["media_type"] = "TEXT"

        async with httpx.AsyncClient(timeout=60) as client:
            r1 = await client.post(
                f"{base}/{threads_user_id}/threads",
                data=container_params,
            )
            r1.raise_for_status()
            creation_id = r1.json().get("id", "")

            # Step 2 – publish
            r2 = await client.post(
                f"{base}/{threads_user_id}/threads_publish",
                data={"creation_id": creation_id, "access_token": access_token},
            )
            r2.raise_for_status()
            media_id = r2.json().get("id", "")

        return PostResult(
            success=True,
            post_id=str(media_id),
            url=f"https://www.threads.net/t/{media_id}",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# Telegram
# --------------------------------------------------------------------------- #

async def post_telegram(
    bot_token: str,
    chat_id: str,
    text: str,
    image_url: str | None = None,
    parse_mode: str = "HTML",
) -> PostResult:
    """Send a message (or photo) to a Telegram channel/group via Bot API."""
    try:
        base = f"https://api.telegram.org/bot{bot_token}"

        async with httpx.AsyncClient(timeout=30) as client:
            if image_url:
                resp = await client.post(
                    f"{base}/sendPhoto",
                    json={
                        "chat_id": chat_id,
                        "photo": image_url,
                        "caption": text[:1024],
                        "parse_mode": parse_mode,
                    },
                )
            else:
                resp = await client.post(
                    f"{base}/sendMessage",
                    json={
                        "chat_id": chat_id,
                        "text": text[:4096],
                        "parse_mode": parse_mode,
                        "disable_web_page_preview": False,
                    },
                )
            resp.raise_for_status()
            message_id = str(resp.json().get("result", {}).get("message_id", ""))

        return PostResult(
            success=True,
            post_id=message_id,
            url=f"https://t.me/{str(chat_id).lstrip('@')}/{message_id}",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))


# --------------------------------------------------------------------------- #
# Snapchat (Snap Marketing API – organic story via Creative API)
# --------------------------------------------------------------------------- #

async def post_snapchat(
    access_token: str,
    ad_account_id: str,
    title: str,
    media_url: str,
) -> PostResult:
    """
    Create a Snap Ad creative via the Snap Marketing API.
    Requires media_url (image or video) and an Ad Account ID.
    """
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }
        body = {
            "creatives": [
                {
                    "name": title[:75],
                    "ad_account_id": ad_account_id,
                    "type": "SNAP_AD",
                    "top_snap_media_id": media_url,
                    "top_snap_crop_position": "MIDDLE",
                }
            ]
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://adsapi.snapchat.com/v1/creatives",
                json=body,
                headers=headers,
            )
            resp.raise_for_status()
            creative_id = resp.json().get("creatives", [{}])[0].get("creative", {}).get("id", "")

        return PostResult(
            success=True,
            post_id=str(creative_id),
            url="https://ads.snapchat.com/",
        )
    except Exception as exc:
        return PostResult(success=False, error=str(exc))
