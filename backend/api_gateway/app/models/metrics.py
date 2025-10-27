"""Usage, reputation and analytics related models."""

from __future__ import annotations

from enum import Enum as PyEnum
from typing import Any
from uuid import UUID

from sqlalchemy import Date, Enum as SAEnum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base_class import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UsageEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Metering event per account."""

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("account.id", ondelete="CASCADE"), nullable=False, index=True
    )
    metric: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Numeric(16, 4))
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="unit")
    properties: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    accounted_on: Mapped[Any | None] = mapped_column(Date)

    account: Mapped["Account"] = relationship()


class ReputationSource(str, PyEnum):
    serp = "serp"
    social = "social"
    news = "news"
    forum = "forum"


class Mention(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """External mention tracked for reputation monitoring."""

    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source: Mapped[ReputationSource] = mapped_column(
        SAEnum(ReputationSource, name="reputation_source"),
        default=ReputationSource.serp,
        nullable=False,
    )
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    sentiment: Mapped[str | None] = mapped_column(String(30))
    visibility: Mapped[int | None] = mapped_column()
    serp_position: Mapped[int | None] = mapped_column()
    excerpt: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)

    project: Mapped["Project"] = relationship()


class ReputationScore(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Aggregate reputation scoring per project."""

    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), nullable=False, index=True
    )
    score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    drivers: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    measured_on: Mapped[Any | None] = mapped_column(Date)

    project: Mapped["Project"] = relationship()
