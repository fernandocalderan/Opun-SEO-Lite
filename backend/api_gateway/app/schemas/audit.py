"""Audit related schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import Field

from ..models.audits import AuditItemSeverity, AuditStatus, AuditType
from .base import APIModel, TimestampedModel


class AuditCreate(APIModel):
    type: AuditType = AuditType.full
    parameters: dict[str, Any] = Field(default_factory=dict)


class AuditRead(TimestampedModel):
    project_id: UUID
    type: AuditType
    status: AuditStatus
    score: float | None
    started_at: datetime | None
    finished_at: datetime | None
    parameters: dict[str, Any]


class AuditItemCreate(APIModel):
    url: str | None = None
    category: str
    severity: AuditItemSeverity = AuditItemSeverity.medium
    issue_code: str
    summary: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    recommendation: str | None = None


class AuditItemRead(TimestampedModel):
    audit_id: UUID
    url: str | None
    category: str
    severity: AuditItemSeverity
    issue_code: str
    summary: str | None
    payload: dict[str, Any]
    recommendation: str | None
