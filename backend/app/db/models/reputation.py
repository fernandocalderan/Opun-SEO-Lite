from __future__ import annotations

from datetime import datetime

from sqlalchemy import Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SerpRankCache(Base):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    domain: Mapped[str] = mapped_column(String(255), nullable=False)
    keyword: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int | None] = mapped_column(nullable=True)
    found_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)


Index("ix_serp_rank_cache_key", SerpRankCache.domain, SerpRankCache.keyword, unique=True)

