from fastapi import APIRouter, Depends, HTTPException, Header
from jose import jwt, JWTError
from pydantic import BaseModel, Field
from datetime import date
from sqlalchemy.orm import Session
from app.core.config import settings
from app.infra.db import SessionLocal
from app.infra.models import Simulation, PaymentTerm
from app.domain.rules import annual_rate_for_dates, effective_rate

router = APIRouter(prefix="/simulations", tags=["simulations"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def get_current_user_id(authorization: str = Header(None)):
    # Espera header Authorization: Bearer <token>
    if not authorization: 
        raise HTTPException(401, "No autorizado")
    
    try:
        # Extraer el token del formato "Bearer <token>"
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        return int(payload["sub"])
    except (JWTError, IndexError, KeyError):
        raise HTTPException(401, "Token inválido")

class SimIn(BaseModel):
    amount: float = Field(gt=0)
    term: PaymentTerm
    start_date: date
    end_date: date

class SimOut(SimIn):
    id: int
    rate_applied: float

@router.post("", response_model=SimOut)
def create_simulation(payload: SimIn, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    annual = annual_rate_for_dates(payload.start_date, payload.end_date)
    rate = effective_rate(payload.term.value, annual)
    sim = Simulation(
        user_id=user_id, amount=payload.amount, term=payload.term,
        start_date=payload.start_date, end_date=payload.end_date, rate_applied=rate
    )
    db.add(sim); db.commit(); db.refresh(sim)
    return sim

@router.get("", response_model=list[SimOut])
def list_simulations(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return db.query(Simulation).filter(Simulation.user_id==user_id).order_by(Simulation.created_at.desc()).all()

@router.put("/{sim_id}", response_model=SimOut)
def update_simulation(sim_id: int, payload: SimIn, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    sim = db.get(Simulation, sim_id)
    if not sim or sim.user_id != user_id: raise HTTPException(404, "No encontrada")
    annual = annual_rate_for_dates(payload.start_date, payload.end_date)
    sim.amount = payload.amount
    sim.term = payload.term
    sim.start_date = payload.start_date
    sim.end_date = payload.end_date
    sim.rate_applied = effective_rate(payload.term.value, annual)
    db.commit(); db.refresh(sim)
    return sim

@router.delete("/{sim_id}")
def delete_simulation(sim_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    sim = db.get(Simulation, sim_id)
    if not sim or sim.user_id != user_id: raise HTTPException(404, "No encontrada")
    db.delete(sim); db.commit()
    return {"ok": True}