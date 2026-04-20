import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt

pwd_ctx       = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET    = os.getenv("JWT_SECRET", "change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_H  = 24


def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def create_token(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_H)
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
