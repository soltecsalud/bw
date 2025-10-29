# app/core/security.py
from datetime import datetime, timedelta
from jose import jwt
from passlib.hash import pbkdf2_sha256   # 👈 usar este
from app.core.config import settings

def hash_password(pw: str) -> str:
    return pbkdf2_sha256.hash(pw)

def verify_password(pw: str, hashed: str) -> bool:
    return pbkdf2_sha256.verify(pw, hashed)

def create_access_token(sub: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": sub, "exp": exp}, settings.JWT_SECRET, algorithm=settings.JWT_ALG)
