"""Audit related persistence models."""

from __future__ import annotations

from enum import Enum as PyEnum
from typing import Any
from uuid import UUID

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base_class import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AuditType(str, PyEnum):
    full = "full"
    technical = "technical"
    content = "content"
    reputation = "reputation"
    custom = "custom"


class AuditStatus(str, PyEnum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class Audit(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Audit execution metadata."""

    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[AuditType] = mapped_column(
        SAEnum(AuditType, name="audit_type"), default=AuditType.full, nullable=False
    )
    status: Mapped[AuditStatus] = mapped_column(
        SAEnum(AuditStatus, name="audit_status"), default=AuditStatus.pending, nullable=False
    )
    score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    started_at: Mapped[Any | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[Any | None] = mapped_column(DateTime(timezone=True))
    parameters: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)

    project: Mapped["Project"] = relationship(back_populates="audits")
    items: Mapped[list["AuditItem"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan", order_by="AuditItem.severity.desc()"
    )


class AuditItemSeverity(str, PyEnum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    info = "info"


class AuditItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Individual issue found during an audit."""

    audit_id: Mapped[UUID] = mapped_column(
        ForeignKey("audit.id", ondelete="CASCADE"), nullable=False, index=True
    )
    url: Mapped[str | None] = mapped_column(String(1024))
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[AuditItemSeverity] = mapped_column(
        SAEnum(AuditItemSeverity, name="audit_item_severity"),
        default=AuditItemSeverity.medium,
        nullable=False,
    )
    issue_code: Mapped[str] = mapped_column(String(100), nullable=False)
    summary: Mapped[str | None] = mapped_column(String(500))
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    recommendation: Mapped[str | None] = mapped_column(Text)

    audit: Mapped["Audit"] = relationship(back_populates="items")
