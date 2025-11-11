from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


Schedule = Literal["none", "hourly", "daily", "weekly", "monthly"]


class ProjectOut(BaseModel):
    id: str
    name: str
    primary_url: str
    keywords: list[str] = Field(default_factory=list)
    monitoring_enabled: bool
    schedule: Schedule
    last_audit_at: Optional[datetime]

    class Config:
        from_attributes = True

    @field_validator("schedule", mode="before")
    @classmethod
    def _schedule_to_literal(cls, v):
        try:
            # Convert Enum("...") to its value
            return getattr(v, "value", v)
        except Exception:
            return v


class ProjectCreate(BaseModel):
    name: str
    primary_url: str
    keywords: list[str] = Field(default_factory=list)
    monitoring_enabled: bool = False
    schedule: Schedule = "none"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    primary_url: Optional[str] = None
    keywords: Optional[list[str]] = None
    monitoring_enabled: Optional[bool] = None
    schedule: Optional[Schedule] = None
    last_audit_at: Optional[datetime] = None
