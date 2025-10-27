"""Common schema helpers."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class APIModel(BaseModel):
    """Base model with ORM compatibility."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class TimestampedModel(APIModel):
    """Schema with timestamp fields."""

    id: UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None
