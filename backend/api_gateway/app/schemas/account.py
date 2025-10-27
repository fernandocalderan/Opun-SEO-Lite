"""Account related schemas."""

from typing import Any
from uuid import UUID

from pydantic import Field

from ..models.accounts import AccountPlan, UserRole
from .base import APIModel, TimestampedModel


class AccountCreate(APIModel):
    name: str
    plan: AccountPlan = AccountPlan.free
    brand_prefs: dict[str, Any] = Field(default_factory=dict)


class AccountUpdate(APIModel):
    name: str | None = None
    plan: AccountPlan | None = None
    brand_prefs: dict[str, Any] | None = None
    is_active: bool | None = None


class AccountRead(TimestampedModel):
    name: str
    plan: AccountPlan
    brand_prefs: dict[str, Any]
    is_active: bool


class APIKeyRead(TimestampedModel):
    name: str
    scopes: list[str]
    rate_limit_per_minute: int | None
    account_id: UUID
    is_active: bool
