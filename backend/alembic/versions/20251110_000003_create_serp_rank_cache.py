"""create serp rank cache

Revision ID: 20251110_000003
Revises: 20251110_000002
Create Date: 2025-11-10 00:40:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20251110_000003"
down_revision = "20251110_000002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "serprankcache",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("domain", sa.String(length=255), nullable=False),
        sa.Column("keyword", sa.String(length=255), nullable=False),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column("found_url", sa.String(length=2048), nullable=True),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_serp_rank_cache_key", "serprankcache", ["domain", "keyword"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_serp_rank_cache_key", table_name="serprankcache")
    op.drop_table("serprankcache")

