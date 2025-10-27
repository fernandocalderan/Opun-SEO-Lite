"""Service logic for audit entities."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Audit, AuditItem, AuditStatus
from ..schemas.audit import AuditCreate, AuditItemCreate


class AuditService:
    """Operations for audits and their items."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, project_id: UUID, payload: AuditCreate) -> Audit:
        audit = Audit(project_id=project_id, **payload.model_dump())
        self.session.add(audit)
        await self.session.flush()
        return audit

    async def get(self, audit_id: UUID) -> Audit | None:
        stmt = select(Audit).where(Audit.id == audit_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def mark_status(self, audit: Audit, status: AuditStatus) -> Audit:
        audit.status = status
        await self.session.flush()
        return audit

    async def add_item(self, audit_id: UUID, payload: AuditItemCreate) -> AuditItem:
        item = AuditItem(audit_id=audit_id, **payload.model_dump())
        self.session.add(item)
        await self.session.flush()
        return item

    async def list_items(self, audit_id: UUID) -> list[AuditItem]:
        stmt = select(AuditItem).where(AuditItem.audit_id == audit_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
