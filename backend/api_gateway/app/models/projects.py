"""Project and content related models."""

from __future__ import annotations

from enum import Enum as PyEnum
from typing import Any
from uuid import UUID

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base_class import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ProjectStatus(str, PyEnum):
    active = "active"
    paused = "paused"
    archived = "archived"


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SEO project associated with an account."""

    account_id: Mapped[UUID] = mapped_column(ForeignKey("account.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    cms_type: Mapped[str | None] = mapped_column(String(50))
    connectors: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    status: Mapped[ProjectStatus] = mapped_column(
        SAEnum(ProjectStatus, name="project_status"), default=ProjectStatus.active, nullable=False
    )

    account: Mapped["Account"] = relationship(back_populates="projects")
    audits: Mapped[list["Audit"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", order_by="Audit.created_at.desc()"
    )
    keywords: Mapped[list["Keyword"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    actions: Mapped[list["Action"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    reports: Mapped[list["Report"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", order_by="Report.generated_at.desc()"
    )


class KeywordIntent(str, PyEnum):
    informational = "informational"
    transactional = "transactional"
    navigational = "navigational"
    commercial = "commercial"


class Keyword(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Keyword tracked by the project."""

    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), nullable=False, index=True
    )
    keyword: Mapped[str] = mapped_column(String(255), nullable=False)
    intent: Mapped[KeywordIntent | None] = mapped_column(
        SAEnum(KeywordIntent, name="keyword_intent"), nullable=True
    )
    value_estimate: Mapped[float | None] = mapped_column()

    project: Mapped["Project"] = relationship(back_populates="keywords")


class ActionStatus(str, PyEnum):
    draft = "draft"
    proposed = "proposed"
    approved = "approved"
    applied = "applied"
    rolled_back = "rolled_back"


class Action(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Action proposed or executed within a project."""

    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    target: Mapped[str | None] = mapped_column(String(500))
    ai_proposal: Mapped[str | None] = mapped_column(Text)
    status: Mapped[ActionStatus] = mapped_column(
        SAEnum(ActionStatus, name="action_status"), default=ActionStatus.draft, nullable=False
    )
    applied_at: Mapped[Any | None] = mapped_column(DateTime(timezone=True))

    project: Mapped["Project"] = relationship(back_populates="actions")


class Report(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Generated report for a project."""

    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), nullable=False, index=True
    )
    html_url: Mapped[str | None] = mapped_column(String(1024))
    pdf_url: Mapped[str | None] = mapped_column(String(1024))
    summary: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    generated_at: Mapped[Any | None] = mapped_column(DateTime(timezone=True))

    project: Mapped["Project"] = relationship(back_populates="reports")
