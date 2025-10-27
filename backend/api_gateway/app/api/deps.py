"""FastAPI dependency helpers."""

from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..services.api_keys import APIKeyService

API_KEY_HEADER = APIKeyHeader(name="x-api-key", auto_error=False)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_session():
        yield session


async def get_api_key(
    api_key_header: str | None = Security(API_KEY_HEADER),
) -> str | None:
    """Retrieve the API key from headers when available."""
    return api_key_header


async def get_current_account(
    api_key: str | None = Depends(get_api_key),
    session: AsyncSession = Depends(get_session),
):
    """Resolve the account tied to the provided API key."""
    if api_key is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing API key")

    service = APIKeyService(session=session)
    account = await service.resolve_account(api_key=api_key)
    if account is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
    return account
