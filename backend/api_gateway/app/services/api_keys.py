"""API key helper service."""

from __future__ import annotations

import hashlib
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import APIKey, Account


class APIKeyService:
    """Operations related to API key management."""

    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def hash_key(api_key: str) -> str:
        """Return a SHA256 hash for the API key."""
        return hashlib.sha256(api_key.encode("utf-8")).hexdigest()

    async def resolve_account(self, api_key: str) -> Optional[Account]:
        """Return the account tied to the provided API key."""
        hashed = self.hash_key(api_key)
        stmt = (
            select(Account)
            .join(APIKey, APIKey.account_id == Account.id)
            .where(APIKey.hashed_key == hashed, APIKey.is_active.is_(True), Account.is_active.is_(True))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def rotate_key(self, api_key: APIKey, new_key: str) -> APIKey:
        """Update the hash for the API key."""
        api_key.hashed_key = self.hash_key(new_key)
        await self.session.flush()
        return api_key
