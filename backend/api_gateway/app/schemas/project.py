"""Project related schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import Field

from ..models.projects import ActionStatus, ProjectStatus
from .base import APIModel, TimestampedModel


class ProjectCreate(APIModel):
    name: str
    domain: str
    cms_type: str | None = None
    connectors: dict[str, Any] = Field(default_factory=dict)


class ProjectUpdate(APIModel):
    name: str | None = None
    domain: str | None = None
    cms_type: str | None = None
    connectors: dict[str, Any] | None = None
    status: ProjectStatus | None = None


class ProjectRead(TimestampedModel):
    account_id: UUID
    name: str
    domain: str
    cms_type: str | None
    connectors: dict[str, Any]
    status: ProjectStatus


class KeywordRead(TimestampedModel):
    project_id: UUID
    keyword: str
    intent: str | None
    value_estimate: float | None


class ActionRead(TimestampedModel):
    project_id: UUID
    type: str
    target: str | None
    ai_proposal: str | None
    status: ActionStatus
    applied_at: datetime | None
