import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import router
from app.ws.handler import device_ws_endpoint

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s")
log = logging.getLogger(__name__)

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _run_migrations():
    from app.db.session import engine
    from app.db.models import Base
    Base.metadata.create_all(bind=engine)
    log.info("DB tables ensured")


def _ensure_default_admin():
    from app.db.session import SessionLocal
    from app.db.models import AdminUser
    from app.services.auth_service import hash_password

    email    = os.getenv("ADMIN_EMAIL",    "admin@xshield.com.tr")
    password = os.getenv("ADMIN_PASSWORD", "changeme")

    db = SessionLocal()
    try:
        if not db.query(AdminUser).first():
            db.add(AdminUser(email=email, password_hash=hash_password(password), role="super_admin"))
            db.commit()
            log.info("Default admin created: %s", email)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    _run_migrations()
    _ensure_default_admin()
    yield


app = FastAPI(title="xSignage API", version="1.0.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware,
                   allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(router)

# Serve uploaded media files
app.mount("/media", StaticFiles(directory=UPLOAD_DIR), name="media")


@app.websocket("/ws/device/{device_id}")
async def ws_device(websocket: WebSocket, device_id: str):
    await device_ws_endpoint(websocket, device_id)


@app.get("/health")
def health():
    return {"status": "ok"}
