"""add failure_reason to audit

Revision ID: 20251111_000005
Revises: 20251111_000004
Create Date: 2025-11-11 00:00:05

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20251111_000005"
down_revision = "20251111_000004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("audit", sa.Column("failure_reason", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("audit", "failure_reason")

