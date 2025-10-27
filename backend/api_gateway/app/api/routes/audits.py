"""Audit endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.audit import AuditCreate, AuditItemCreate, AuditItemRead, AuditRead
from ...services.audits import AuditService
from ...services.projects import ProjectService
from ..deps import get_db_session

router = APIRouter()


@router.post("/projects/{project_id}", response_model=AuditRead, status_code=status.HTTP_201_CREATED)
async def create_audit_for_project(
    project_id: UUID,
    payload: AuditCreate,
    session: AsyncSession = Depends(get_db_session),
) -> AuditRead:
    project_service = ProjectService(session)
    if await project_service.get(project_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    audit_service = AuditService(session)
    audit = await audit_service.create(project_id=project_id, payload=payload)
    return AuditRead.model_validate(audit)


@router.get("/{audit_id}", response_model=AuditRead)
async def read_audit(
    audit_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> AuditRead:
    audit_service = AuditService(session)
    audit = await audit_service.get(audit_id)
    if audit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")
    return AuditRead.model_validate(audit)


@router.post("/{audit_id}/items", response_model=AuditItemRead, status_code=status.HTTP_201_CREATED)
async def create_audit_item(
    audit_id: UUID,
    payload: AuditItemCreate,
    session: AsyncSession = Depends(get_db_session),
) -> AuditItemRead:
    audit_service = AuditService(session)
    audit = await audit_service.get(audit_id)
    if audit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")
    item = await audit_service.add_item(audit_id=audit_id, payload=payload)
    return AuditItemRead.model_validate(item)


@router.get("/{audit_id}/items", response_model=list[AuditItemRead])
async def list_audit_items(
    audit_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> list[AuditItemRead]:
    audit_service = AuditService(session)
    audit = await audit_service.get(audit_id)
    if audit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")

    items = await audit_service.list_items(audit_id)
    return [AuditItemRead.model_validate(item) for item in items]
