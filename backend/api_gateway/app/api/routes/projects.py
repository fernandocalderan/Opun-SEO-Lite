"""Project endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.project import ProjectRead, ProjectUpdate
from ...services.projects import ProjectService
from ..deps import get_db_session

router = APIRouter()


@router.get("/{project_id}", response_model=ProjectRead)
async def read_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> ProjectRead:
    service = ProjectService(session)
    project = await service.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ProjectRead.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    session: AsyncSession = Depends(get_db_session),
) -> ProjectRead:
    service = ProjectService(session)
    project = await service.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project = await service.update(project, payload)
    return ProjectRead.model_validate(project)
