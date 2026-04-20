"""In-memory WebSocket connection registry: device_id → WebSocket."""
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import WebSocket

ws_registry: dict[str, "WebSocket"] = {}
