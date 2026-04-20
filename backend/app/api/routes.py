from fastapi import APIRouter
from app.api.admin import auth, devices, content, playlists

router = APIRouter()

router.include_router(auth.router,      prefix="/v1/admin")
router.include_router(devices.router,   prefix="/v1/admin")
router.include_router(content.router,   prefix="/v1/admin")
router.include_router(playlists.router, prefix="/v1/admin")
