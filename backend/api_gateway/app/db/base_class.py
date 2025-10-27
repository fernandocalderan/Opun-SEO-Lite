"""Base class for SQLAlchemy models."""

from typing import Any
from uuid import uuid4

from sqlalchemy import DateTime, func, inspect
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column


class Base(DeclarativeBase):
    """Declarative base class."""

    @declared_attr.directive
    def __tablename__(cls) -> str:  # type: ignore[override]
        """Generate snake_case table names automatically."""
        name = cls.__name__
        return "".join(["_" + i.lower() if i.isupper() else i for i in name]).lstrip("_")

    @property
    def is_transient(self) -> bool:
        """Return True when the instance has not been persisted yet."""
        return inspect(self).transient


class TimestampMixin:
    """Provide created/updated timestamp columns."""

    created_at: Mapped[Any] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Any] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class UUIDPrimaryKeyMixin:
    """Primary key column using UUID."""

    id: Mapped[Any] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4, unique=True
    )
