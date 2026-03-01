from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# bcrypt only uses first 72 bytes of password
MAX_BCRYPT_BYTES = 72


def _truncate_for_bcrypt(password: str) -> str:
    data = password.encode("utf-8")
    if len(data) <= MAX_BCRYPT_BYTES:
        return password
    return data[:MAX_BCRYPT_BYTES].decode("utf-8", errors="ignore") or password[:1]


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(_truncate_for_bcrypt(plain), hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(_truncate_for_bcrypt(password))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


def get_current_user_email(token: str) -> Optional[str]:
    payload = decode_access_token(token)
    if payload is None:
        return None
    return payload.get("sub")
