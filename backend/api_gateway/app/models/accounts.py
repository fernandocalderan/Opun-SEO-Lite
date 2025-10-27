"""Account and authentication related models."""

from __future__ import annotations

from enum import Enum as PyEnum
from typing import Any
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base_class import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AccountPlan(str, PyEnum):
    free = "free"
    starter = "starter"
    pro = "pro"
    agency = "agency"
    enterprise = "enterprise"


class Account(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Customer account representing an agency or brand."""

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[AccountPlan] = mapped_column(
        SAEnum(AccountPlan, name="account_plan"), default=AccountPlan.free, nullable=False
    )
    brand_prefs: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    users: Mapped[list["User"]] = relationship(back_populates="account", cascade="all, delete-orphan")
    api_keys: Mapped[list["APIKey"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
    projects: Mapped[list["Project"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )


class UserRole(str, PyEnum):
    owner = "owner"
    admin = "admin"
    editor = "editor"
    viewer = "viewer"


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """User belonging to an account."""

    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    full_name: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"), default=UserRole.viewer, nullable=False
    )
    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("account.id", ondelete="CASCADE"), nullable=False
    )
    sso_id: Mapped[str | None] = mapped_column(String(255), unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    account: Mapped["Account"] = relationship(back_populates="users")


class APIKey(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """API key to authenticate programmatic access."""

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_key: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    scopes: Mapped[list[str]] = mapped_column(JSONB, default=list)
    rate_limit_per_minute: Mapped[int | None] = mapped_column(Integer)
    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("account.id", ondelete="CASCADE"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_used_at: Mapped[Any | None] = mapped_column(DateTime(timezone=True))

    account: Mapped["Account"] = relationship(back_populates="api_keys")

    __table_args__ = (UniqueConstraint("account_id", "name", name="uq_api_key_account_name"),)
