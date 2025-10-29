from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.infra.db import SessionLocal
from app.infra.models import User
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterIn(BaseModel):
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@router.post("/register")
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email==payload.email).first():
        raise HTTPException(400, "Email ya registrado")
    u = User(email=payload.email, password_hash=hash_password(payload.password))
    db.add(u); db.commit()
    return {"ok": True}

@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email==payload.email).first()
    if not u or not verify_password(payload.password, u.password_hash):
        raise HTTPException(401, "Credenciales inválidas")
    token = create_access_token(str(u.id))
    return {"access_token": token, "token_type":"bearer"}
