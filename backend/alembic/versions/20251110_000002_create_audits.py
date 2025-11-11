"""create audits and audit_results tables

Revision ID: 20251110_000002
Revises: 20251110_000001
Create Date: 2025-11-10 00:20:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20251110_000002"
down_revision = "20251110_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    audit_status_enum = sa.Enum("pending", "running", "completed", "failed", name="auditstatus")
    audit_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "audit",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("project.id"), nullable=True),
        sa.Column("url", sa.String(length=2048), nullable=False),
        sa.Column("keywords", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("scan_depth", sa.String(length=16), nullable=True),
        sa.Column("include_serp", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("include_reputation", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("include_technical", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("status", audit_status_enum, nullable=False, server_default=sa.text("'pending'")),
        sa.Column("type", sa.String(length=64), nullable=False, server_default=sa.text("'Full crawl'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "auditresult",
        sa.Column("audit_id", sa.String(length=36), sa.ForeignKey("audit.id"), primary_key=True),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("overall_score", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("critical_issues", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("warnings", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("opportunities", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )


def downgrade() -> None:
    op.drop_table("auditresult")
    op.drop_table("audit")
    audit_status_enum = sa.Enum("pending", "running", "completed", "failed", name="auditstatus")
    audit_status_enum.drop(op.get_bind(), checkfirst=True)

