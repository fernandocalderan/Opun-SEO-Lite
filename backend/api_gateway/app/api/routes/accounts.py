"""Account endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.account import AccountCreate, AccountRead, AccountUpdate
from ...schemas.project import ProjectCreate, ProjectRead
from ...services.accounts import AccountService
from ...services.projects import ProjectService
from ..deps import get_db_session

router = APIRouter()


@router.post("", response_model=AccountRead, status_code=status.HTTP_201_CREATED)
async def create_account(
    payload: AccountCreate,
    session: AsyncSession = Depends(get_db_session),
) -> AccountRead:
    service = AccountService(session)
    account = await service.create(payload)
    return AccountRead.model_validate(account)


@router.get("/{account_id}", response_model=AccountRead)
async def read_account(
    account_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> AccountRead:
    service = AccountService(session)
    account = await service.get(account_id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return AccountRead.model_validate(account)


@router.patch("/{account_id}", response_model=AccountRead)
async def update_account(
    account_id: UUID,
    payload: AccountUpdate,
    session: AsyncSession = Depends(get_db_session),
) -> AccountRead:
    service = AccountService(session)
    account = await service.get(account_id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    account = await service.update(account, payload)
    return AccountRead.model_validate(account)


@router.get("/{account_id}/projects", response_model=list[ProjectRead])
async def list_projects_for_account(
    account_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> list[ProjectRead]:
    account_service = AccountService(session)
    if await account_service.get(account_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    project_service = ProjectService(session)
    projects = await project_service.list_for_account(account_id)
    return [ProjectRead.model_validate(project) for project in projects]


@router.post("/{account_id}/projects", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project_for_account(
    account_id: UUID,
    payload: ProjectCreate,
    session: AsyncSession = Depends(get_db_session),
) -> ProjectRead:
    account_service = AccountService(session)
    if await account_service.get(account_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    project_service = ProjectService(session)
    project = await project_service.create(account_id=account_id, payload=payload)
    return ProjectRead.model_validate(project)
