from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class CreateAuditIn(BaseModel):
    url: str
    keywords: list[str] | None = None
    scanDepth: Literal["light", "standard", "full"] | None = None
    includeSerp: bool | None = True
    includeReputation: bool | None = True
    includeTechnical: bool | None = True
    alerting: dict | None = None
    notes: str | None = None
    projectName: str | None = None


class CreateAuditOut(BaseModel):
    id: str


class AuditStatusOut(BaseModel):
    id: str
    status: Literal["pending", "running", "completed", "failed"]


class AuditSummaryOut(BaseModel):
    overall_score: int
    critical_issues: int
    warnings: int
    opportunities: int
    last_run: str


class QueueItem(BaseModel):
    id: str
    project: str
    type: str
    status: Literal["running", "pending", "completed", "failed"]
    started_at: Optional[str]
    eta_seconds: Optional[int]


class QueueOut(BaseModel):
    items: list[QueueItem]
    next_cursor: Optional[str] = None
    total: Optional[int] = None


class HistoryItem(BaseModel):
    id: str
    project: str
    completed_at: str
    score: int
    critical_issues: int
    owner: str


class HistoryOut(BaseModel):
    items: list[HistoryItem]
    next_cursor: Optional[str] = None
    total: Optional[int] = None


class PerformancePoint(BaseModel):
    id: str
    project: str
    completed_at: str
    score: int
    critical_issues: int
    duration_seconds: int


class PerformanceAgg(BaseModel):
    average_score: float
    average_duration_seconds: float
    max_duration_seconds: int
    sample_size: int
    duration_distribution: list[dict]


class PerformanceOut(BaseModel):
    points: list[PerformancePoint]
    aggregates: PerformanceAgg

