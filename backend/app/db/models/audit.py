from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AuditStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class Audit(Base):
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("project.id"), nullable=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    keywords: Mapped[list[str]] = mapped_column(JSONB, default=list)
    scan_depth: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    include_serp: Mapped[bool] = mapped_column(default=True)
    include_reputation: Mapped[bool] = mapped_column(default=True)
    include_technical: Mapped[bool] = mapped_column(default=True)
    status: Mapped[AuditStatus] = mapped_column(SAEnum(AuditStatus), default=AuditStatus.pending, nullable=False)
    type: Mapped[str] = mapped_column(String(64), default="Full crawl")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    result: Mapped["AuditResult"] = relationship("AuditResult", back_populates="audit", uselist=False)


class AuditResult(Base):
    audit_id: Mapped[str] = mapped_column(String(36), ForeignKey("audit.id"), primary_key=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    overall_score: Mapped[int] = mapped_column(Integer, default=0)
    critical_issues: Mapped[int] = mapped_column(Integer, default=0)
    warnings: Mapped[int] = mapped_column(Integer, default=0)
    opportunities: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    audit: Mapped[Audit] = relationship("Audit", back_populates="result")
