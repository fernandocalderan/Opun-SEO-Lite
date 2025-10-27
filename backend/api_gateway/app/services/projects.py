"""Service logic for project entities."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Project
from ..schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    """Persistence helpers for projects."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, account_id: UUID, payload: ProjectCreate) -> Project:
        project = Project(account_id=account_id, **payload.model_dump())
        self.session.add(project)
        await self.session.flush()
        return project

    async def get(self, project_id: UUID) -> Project | None:
        stmt = select(Project).where(Project.id == project_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, project: Project, payload: ProjectUpdate) -> Project:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(project, field, value)
        await self.session.flush()
        return project

    async def list_for_account(self, account_id: UUID) -> list[Project]:
        stmt = select(Project).where(Project.account_id == account_id).order_by(Project.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
