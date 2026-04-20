#!/usr/bin/env python3
"""
xSignage Linux Agent
====================
Runs on Raspberry Pi / any Linux box connected to a display.

Usage:
  python3 agent.py --server wss://signage.xshield.com.tr \
                   --device-id <uuid> --api-key <key>

Or set environment variables:
  SIGNAGE_SERVER    SIGNAGE_DEVICE_ID    SIGNAGE_API_KEY
"""
import argparse
import asyncio
import json
import logging
import os
import subprocess
import sys
import signal
from pathlib import Path

import httpx
import websockets

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("xsignage-agent")

CACHE_DIR   = Path(os.getenv("CACHE_DIR", "/var/cache/xsignage"))
PLAYER_PORT = int(os.getenv("PLAYER_PORT", "8888"))
HEARTBEAT_INTERVAL = 30  # seconds


# ── HTML Player ───────────────────────────────────────────────────────────────

PLAYER_HTML = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ background: #000; overflow: hidden; width: 100vw; height: 100vh; }}
  .slide {{ position: absolute; inset: 0; display: none; justify-content: center;
            align-items: center; }}
  .slide.active {{ display: flex; }}
  .slide img {{ max-width: 100%; max-height: 100%; object-fit: contain; }}
  .slide video {{ width: 100%; height: 100%; object-fit: contain; }}
  iframe {{ width: 100%; height: 100%; border: none; }}
</style>
</head>
<body>
<div id="player"></div>
<script>
const playlist = {playlist_json};
let current = 0;
let timer = null;

function showSlide(idx) {{
  clearTimeout(timer);
  const slides = document.querySelectorAll('.slide');
  slides.forEach(s => s.classList.remove('active'));
  if (!slides.length) return;
  const slide = slides[idx % slides.length];
  slide.classList.add('active');

  // For video, wait for it to end (or use duration as fallback)
  const video = slide.querySelector('video');
  if (video) {{
    video.currentTime = 0;
    video.play();
    const dur = playlist[idx % playlist.length].duration * 1000;
    timer = setTimeout(() => showSlide((idx + 1) % slides.length), dur);
  }} else {{
    const dur = playlist[idx % playlist.length].duration * 1000;
    timer = setTimeout(() => showSlide((idx + 1) % slides.length), dur);
  }}
}}

function buildPlayer() {{
  const container = document.getElementById('player');
  container.innerHTML = '';
  if (!playlist.length) {{
    document.body.style.background = '#111';
    return;
  }}
  playlist.forEach((item, i) => {{
    const div = document.createElement('div');
    div.className = 'slide' + (i === 0 ? ' active' : '');
    if (item.type === 'image') {{
      const img = document.createElement('img');
      img.src = item.url;
      div.appendChild(img);
    }} else if (item.type === 'video') {{
      const vid = document.createElement('video');
      vid.src = item.url;
      vid.muted = true;
      vid.loop = playlist.length === 1;
      div.appendChild(vid);
    }} else if (item.type === 'html') {{
      const fr = document.createElement('iframe');
      fr.src = item.url;
      div.appendChild(fr);
    }}
    container.appendChild(div);
  }});
  showSlide(0);
}}

buildPlayer();

// Reload signal via localStorage
window.addEventListener('storage', (e) => {{
  if (e.key === 'xsignage_reload') location.reload();
}});
</script>
</body>
</html>
"""


# ── Local HTTP Server ─────────────────────────────────────────────────────────

class PlayerServer:
    """Tiny aiohttp server that serves the HTML player + cached media."""

    def __init__(self):
        self._playlist: list[dict] = []
        self._app = None
        self._runner = None

    def set_playlist(self, items: list[dict]):
        self._playlist = items

    def _build_html(self) -> str:
        js_items = json.dumps([
            {"url": f"http://localhost:{PLAYER_PORT}/media/{Path(i['url']).name}",
             "type": i["file_type"],
             "duration": i["duration"]}
            for i in self._playlist
        ])
        return PLAYER_HTML.format(playlist_json=js_items)

    async def start(self):
        from aiohttp import web

        async def handle_player(request):
            return web.Response(text=self._build_html(), content_type="text/html")

        async def handle_media(request):
            filename = request.match_info["filename"]
            path = CACHE_DIR / filename
            if not path.exists():
                raise web.HTTPNotFound()
            return web.FileResponse(path)

        app = web.Application()
        app.router.add_get("/", handle_player)
        app.router.add_get("/media/{filename}", handle_media)

        self._runner = web.AppRunner(app)
        await self._runner.setup()
        site = web.TCPSite(self._runner, "127.0.0.1", PLAYER_PORT)
        await site.start()
        log.info("Player server on http://localhost:%d", PLAYER_PORT)

    async def stop(self):
        if self._runner:
            await self._runner.cleanup()


# ── Chromium Controller ───────────────────────────────────────────────────────

class ChromiumController:
    def __init__(self):
        self._proc: subprocess.Popen | None = None

    def launch(self):
        if self._proc and self._proc.poll() is None:
            return
        url  = f"http://localhost:{PLAYER_PORT}"
        cmd  = [
            "chromium-browser",
            "--kiosk",
            "--noerrdialogs",
            "--disable-infobars",
            "--disable-session-crashed-bubble",
            "--disable-restore-session-state",
            "--no-first-run",
            "--disable-translate",
            "--autoplay-policy=no-user-gesture-required",
            "--check-for-update-interval=604800",
            url,
        ]
        # Fallback binary names
        for binary in ("chromium-browser", "chromium", "google-chrome", "google-chrome-stable"):
            cmd[0] = binary
            try:
                self._proc = subprocess.Popen(
                    cmd,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    env={**os.environ, "DISPLAY": os.getenv("DISPLAY", ":0")},
                )
                log.info("Launched %s (pid %d)", binary, self._proc.pid)
                return
            except FileNotFoundError:
                continue
        log.error("Chromium not found. Install with: apt install chromium-browser")

    def reload(self):
        """Trigger reload via localStorage write (xdotool approach)."""
        try:
            subprocess.run(
                ["xdotool", "key", "--clearmodifiers", "F5"],
                env={**os.environ, "DISPLAY": os.getenv("DISPLAY", ":0")},
                check=False, capture_output=True,
            )
        except FileNotFoundError:
            pass  # xdotool optional

    def kill(self):
        if self._proc and self._proc.poll() is None:
            self._proc.terminate()


# ── Media Downloader ──────────────────────────────────────────────────────────

async def download_media(server_base: str, items: list[dict]):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    async with httpx.AsyncClient(timeout=60) as client:
        for item in items:
            url      = item["url"]
            filename = Path(url).name
            dest     = CACHE_DIR / filename
            if dest.exists():
                continue
            try:
                log.info("Downloading %s…", filename)
                resp = await client.get(f"{server_base}{url}")
                resp.raise_for_status()
                dest.write_bytes(resp.content)
                log.info("Saved %s (%d bytes)", filename, len(resp.content))
            except Exception as e:
                log.warning("Failed to download %s: %s", url, e)


# ── Main Agent Loop ───────────────────────────────────────────────────────────

async def run_agent(server: str, device_id: str, api_key: str):
    player  = PlayerServer()
    browser = ChromiumController()

    await player.start()
    await asyncio.sleep(1)
    browser.launch()

    # HTTP base for media downloads (ws → http/https)
    http_base = server.replace("wss://", "https://").replace("ws://", "http://")
    ws_url    = f"{server}/ws/device/{device_id}?key={api_key}"

    reconnect_delay = 5

    while True:
        try:
            log.info("Connecting to %s…", ws_url)
            async with websockets.connect(ws_url, ping_interval=20) as ws:
                reconnect_delay = 5
                log.info("Connected ✓")

                # Heartbeat task
                async def heartbeat():
                    while True:
                        await asyncio.sleep(HEARTBEAT_INTERVAL)
                        try:
                            resolution = _get_resolution()
                            await ws.send(json.dumps({
                                "type":       "heartbeat",
                                "resolution": resolution,
                            }))
                        except Exception:
                            break

                hb_task = asyncio.create_task(heartbeat())

                try:
                    async for raw in ws:
                        msg = json.loads(raw)
                        msg_type = msg.get("type")

                        if msg_type == "playlist":
                            items = msg.get("items", [])
                            log.info("Received playlist: %d items", len(items))
                            await download_media(http_base, items)
                            player.set_playlist(items)
                            browser.reload()

                        elif msg_type == "reload":
                            browser.reload()

                        elif msg_type == "pong":
                            pass  # heartbeat ack

                finally:
                    hb_task.cancel()

        except (websockets.exceptions.ConnectionClosed,
                OSError, ConnectionRefusedError) as e:
            log.warning("Disconnected: %s — retry in %ds", e, reconnect_delay)
            await asyncio.sleep(reconnect_delay)
            reconnect_delay = min(reconnect_delay * 2, 60)

        except Exception as e:
            log.error("Unexpected error: %s — retry in %ds", e, reconnect_delay)
            await asyncio.sleep(reconnect_delay)


def _get_resolution() -> str:
    try:
        out = subprocess.check_output(
            ["xrandr", "--current"],
            env={**os.environ, "DISPLAY": os.getenv("DISPLAY", ":0")},
            stderr=subprocess.DEVNULL,
        ).decode()
        for line in out.splitlines():
            if "*" in line:
                return line.strip().split()[0]
    except Exception:
        pass
    return ""


def main():
    parser = argparse.ArgumentParser(description="xSignage Linux Agent")
    parser.add_argument("--server",    default=os.getenv("SIGNAGE_SERVER",    "wss://signage.xshield.com.tr"))
    parser.add_argument("--device-id", default=os.getenv("SIGNAGE_DEVICE_ID", ""))
    parser.add_argument("--api-key",   default=os.getenv("SIGNAGE_API_KEY",   ""))
    args = parser.parse_args()

    if not args.device_id or not args.api_key:
        print("ERROR: --device-id and --api-key are required")
        sys.exit(1)

    loop = asyncio.new_event_loop()

    def _shutdown(*_):
        loop.stop()

    signal.signal(signal.SIGTERM, _shutdown)
    signal.signal(signal.SIGINT,  _shutdown)

    try:
        loop.run_until_complete(run_agent(args.server, args.device_id, args.api_key))
    finally:
        loop.close()


if __name__ == "__main__":
    main()
