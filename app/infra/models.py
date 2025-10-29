from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Numeric, Date, Enum, ForeignKey, text, DateTime
from datetime import datetime
import enum

class Base(DeclarativeBase): pass

class PaymentTerm(str, enum.Enum):
    Mensual = "Mensual"
    Anual   = "Anual"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    simulations: Mapped[list["Simulation"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Simulation(Base):
    __tablename__ = "simulations"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    amount: Mapped[float] = mapped_column(Numeric(14,2))
    term: Mapped[PaymentTerm] = mapped_column(Enum(PaymentTerm, name="payment_term"))
    start_date: Mapped[object] = mapped_column(Date)
    end_date: Mapped[object] = mapped_column(Date)
    rate_applied: Mapped[float] = mapped_column(Numeric(6,4))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user: Mapped[User] = relationship(back_populates="simulations")