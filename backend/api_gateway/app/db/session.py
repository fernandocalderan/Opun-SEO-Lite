"""Database engine and session management."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

import logging
logging.basicConfig()
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)

from ..core.config import get_settings
from .base_class import Base


def _build_engine() -> AsyncEngine:
    """Create async SQLAlchemy engine."""
    settings = get_settings()
    return create_async_engine(
        str(settings.database_url),  # ✅ convertir a string
        echo=settings.db_echo,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        future=True,
    )


engine: AsyncEngine = _build_engine()
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


@asynccontextmanager
async def lifespan_session() -> AsyncIterator[AsyncSession]:
    """Yield an AsyncSession for FastAPI lifespan events."""
    session = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency that provides a database session per request."""
    async with lifespan_session() as session:
        yield session


async def init_db() -> None:
    """Create all tables (used in development/testing)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
