"""
Server-Sent Events (SSE) endpoint for real-time notifications.

Events:
- content:approved    — content item approved
- content:posted      — content published to platform
- content:failed      — content posting failed
- lead:captured       — new lead captured
- engagement:ready    — AI reply ready for review
- system:health       — periodic health pulse

Usage: GET /api/v1/events/stream (requires auth token as query param)
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from collections import defaultdict
from typing import Any, AsyncGenerator

from fastapi import APIRouter, Depends, Query, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.api.deps import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

# ── In-memory event queues per user ──────────────────────────────────────────
# In production, these could be backed by Redis pub/sub for multi-process support.
_user_queues: dict[str, list[asyncio.Queue]] = defaultdict(list)


def publish_event(user_id: str, event_type: str, data: dict[str, Any]) -> None:
    """
    Publish an event to all connected SSE clients for a user.
    Call this from anywhere in the backend (endpoints, tasks, services).
    """
    payload = json.dumps({"type": event_type, "data": data, "ts": time.time()})
    queues = _user_queues.get(user_id, [])
    for q in queues:
        try:
            q.put_nowait({"event": event_type, "data": payload})
        except asyncio.QueueFull:
            pass  # Drop if client can't keep up


async def _event_generator(user_id: str) -> AsyncGenerator[dict, None]:
    """Yield SSE events for a specific user."""
    queue: asyncio.Queue = asyncio.Queue(maxsize=100)
    _user_queues[user_id].append(queue)
    try:
        # Initial heartbeat
        yield {"event": "connected", "data": json.dumps({"status": "connected"})}

        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=30.0)
                yield event
            except asyncio.TimeoutError:
                # Send keepalive ping every 30s
                yield {"event": "ping", "data": json.dumps({"ts": time.time()})}
    finally:
        _user_queues[user_id].remove(queue)
        if not _user_queues[user_id]:
            del _user_queues[user_id]


@router.get("/stream")
async def event_stream(
    current_user: User = Depends(get_current_user),
):
    """
    SSE stream for real-time notifications.

    Connect from the frontend:
    ```js
    const es = new EventSource('/api/v1/events/stream', {
      headers: { Authorization: `Bearer ${token}` }
    });
    es.addEventListener('content:posted', (e) => { ... });
    ```
    """
    return EventSourceResponse(_event_generator(current_user.id))
