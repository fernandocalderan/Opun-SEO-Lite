from __future__ import annotations

from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.db.models.project import Project, ScheduleEnum
from app.schemas.projects import ProjectCreate, ProjectOut, ProjectUpdate


router = APIRouter(prefix="/v1/projects", tags=["projects"])


@router.get("/")
@router.get("")
def list_projects(db: Session = Depends(get_db)) -> list[ProjectOut]:
    result = db.execute(select(Project).order_by(Project.created_at.desc()))
    items = result.scalars().all()
    return [ProjectOut.model_validate(x) for x in items]


@router.post("/")
@router.post("")
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)) -> ProjectOut:
    proj = Project(
        id=str(uuid4()),
        name=payload.name,
        primary_url=payload.primary_url,
        keywords=payload.keywords or [],
        monitoring_enabled=bool(payload.monitoring_enabled),
        schedule=ScheduleEnum(payload.schedule),
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return ProjectOut.model_validate(proj)


@router.patch("/{project_id}")
def update_project(
    project_id: str = Path(..., description="Project ID"),
    patch: ProjectUpdate = ..., 
    db: Session = Depends(get_db),
) -> ProjectOut:
    proj = db.get(Project, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if patch.name is not None:
        proj.name = patch.name
    if patch.primary_url is not None:
        proj.primary_url = patch.primary_url
    if patch.keywords is not None:
        proj.keywords = patch.keywords
    if patch.monitoring_enabled is not None:
        proj.monitoring_enabled = patch.monitoring_enabled
    if patch.schedule is not None:
        proj.schedule = ScheduleEnum(patch.schedule)
    if patch.last_audit_at is not None:
        proj.last_audit_at = patch.last_audit_at

    db.add(proj)
    db.commit()
    db.refresh(proj)
    return ProjectOut.model_validate(proj)


@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)) -> bool:
    proj = db.get(Project, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return True
