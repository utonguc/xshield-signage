from fastapi import HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
from jose import JWTError
from app.services.auth_service import decode_token

_bearer = HTTPBearer()


def get_current_admin(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    try:
        return decode_token(creds.credentials)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
