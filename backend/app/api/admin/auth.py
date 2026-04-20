from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import AdminUser
from app.services.auth_service import verify_password, create_token
from app.api.admin.deps import get_current_admin

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email:    str
    password: str


class TokenResponse(BaseModel):
    token: str
    email: str


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(token=token, email=user.email)


@router.get("/me")
def me(admin: dict = Depends(get_current_admin)):
    return admin
