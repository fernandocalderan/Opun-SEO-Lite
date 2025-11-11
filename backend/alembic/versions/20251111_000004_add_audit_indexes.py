"""add indexes to audit table

Revision ID: 20251111_000004
Revises: 20251110_000003
Create Date: 2025-11-11 00:00:04

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20251111_000004"
down_revision = "20251110_000003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_audit_status_created_at",
        "audit",
        ["status", "created_at"],
    )
    op.create_index(
        "ix_audit_project_id",
        "audit",
        ["project_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_audit_project_id", table_name="audit")
    op.drop_index("ix_audit_status_created_at", table_name="audit")

