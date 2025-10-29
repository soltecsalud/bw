# app/core/config.py
from pydantic import BaseModel
import os

# 👇 NUEVO
from dotenv import load_dotenv
load_dotenv()  # carga backend/.env

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:root@localhost:5433/banco_w")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev_secret_change_me")
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

settings = Settings()
