from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ScheduleEnum(str, Enum):
    none = "none"
    hourly = "hourly"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class Project(Base):
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    primary_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    keywords: Mapped[list[str]] = mapped_column(JSONB, default=list)
    monitoring_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    schedule: Mapped[ScheduleEnum] = mapped_column(SAEnum(ScheduleEnum), default=ScheduleEnum.none, nullable=False)
    last_audit_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

