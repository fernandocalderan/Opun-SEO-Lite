from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings


settings = get_settings()

if not settings.database_url:
    # Default for dev compose
    settings.database_url = "postgresql+psycopg://postgres:postgres@postgres:5432/opun"

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

