"""Service logic for account entities."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Account
from ..schemas.account import AccountCreate, AccountUpdate


class AccountService:
    """Encapsulate account persistence operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, payload: AccountCreate) -> Account:
        account = Account(**payload.model_dump())
        self.session.add(account)
        await self.session.flush()
        return account

    async def get(self, account_id: UUID) -> Account | None:
        stmt = select(Account).where(Account.id == account_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, account: Account, payload: AccountUpdate) -> Account:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(account, field, value)
        await self.session.flush()
        return account
