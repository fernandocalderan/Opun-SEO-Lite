"""create projects table

Revision ID: 20251110_000001
Revises: 
Create Date: 2025-11-10 00:00:01

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "20251110_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    schedule_enum = sa.Enum("none", "hourly", "daily", "weekly", "monthly", name="scheduleenum")
    schedule_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "project",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("primary_url", sa.String(length=2048), nullable=False),
        sa.Column("keywords", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("monitoring_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("schedule", schedule_enum, nullable=False, server_default=sa.text("'none'")),
        sa.Column("last_audit_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_project_name", "project", ["name"])


def downgrade() -> None:
    op.drop_index("ix_project_name", table_name="project")
    op.drop_table("project")
    schedule_enum = sa.Enum("none", "hourly", "daily", "weekly", "monthly", name="scheduleenum")
    schedule_enum.drop(op.get_bind(), checkfirst=True)

