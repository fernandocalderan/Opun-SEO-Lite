"""Initial schema for Opun API gateway."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20241026_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    account_plan = postgresql.ENUM(
        "free",
        "starter",
        "pro",
        "agency",
        "enterprise",
        name="account_plan",
        create_type=False,
    )
    user_role = postgresql.ENUM("owner", "admin", "editor", "viewer", name="user_role", create_type=False)
    project_status = postgresql.ENUM("active", "paused", "archived", name="project_status", create_type=False)
    keyword_intent = postgresql.ENUM(
        "informational",
        "transactional",
        "navigational",
        "commercial",
        name="keyword_intent",
        create_type=False,
    )
    action_status = postgresql.ENUM(
        "draft",
        "proposed",
        "approved",
        "applied",
        "rolled_back",
        name="action_status",
        create_type=False,
    )
    audit_type = postgresql.ENUM(
        "full", "technical", "content", "reputation", "custom", name="audit_type", create_type=False
    )
    audit_status = postgresql.ENUM(
        "pending", "running", "completed", "failed", "cancelled", name="audit_status", create_type=False
    )
    audit_item_severity = postgresql.ENUM(
        "critical",
        "high",
        "medium",
        "low",
        "info",
        name="audit_item_severity",
        create_type=False,
    )
    reputation_source = postgresql.ENUM(
        "serp", "social", "news", "forum", name="reputation_source", create_type=False
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_plan') THEN
                CREATE TYPE account_plan AS ENUM ('free', 'starter', 'pro', 'agency', 'enterprise');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                CREATE TYPE user_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
                CREATE TYPE project_status AS ENUM ('active', 'paused', 'archived');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'keyword_intent') THEN
                CREATE TYPE keyword_intent AS ENUM ('informational', 'transactional', 'navigational', 'commercial');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_status') THEN
                CREATE TYPE action_status AS ENUM ('draft', 'proposed', 'approved', 'applied', 'rolled_back');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_type') THEN
                CREATE TYPE audit_type AS ENUM ('full', 'technical', 'content', 'reputation', 'custom');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_status') THEN
                CREATE TYPE audit_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_item_severity') THEN
                CREATE TYPE audit_item_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
            END IF;
        END$$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reputation_source') THEN
                CREATE TYPE reputation_source AS ENUM ('serp', 'social', 'news', 'forum');
            END IF;
        END$$;
        """
    )

    op.create_table(
        "account",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("plan", account_plan, nullable=False, server_default="free"),
        sa.Column("brand_prefs", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )

    op.create_table(
        "project",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("domain", sa.String(length=255), nullable=False),
        sa.Column("cms_type", sa.String(length=50), nullable=True),
        sa.Column("connectors", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("status", project_status, nullable=False, server_default="active"),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("domain"),
    )

    op.create_table(
        "usage_event",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("metric", sa.String(length=100), nullable=False),
        sa.Column("value", sa.Numeric(precision=16, scale=4), nullable=False),
        sa.Column("unit", sa.String(length=50), nullable=False, server_default="unit"),
        sa.Column("properties", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("accounted_on", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "user",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("email", sa.String(length=320), nullable=False, unique=True),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("role", user_role, nullable=False, server_default="viewer"),
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sso_id", sa.String(length=255), nullable=True, unique=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "api_key",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("hashed_key", sa.String(length=512), nullable=False, unique=True),
        sa.Column("scopes", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("rate_limit_per_minute", sa.Integer(), nullable=True),
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("account_id", "name", name="uq_api_key_account_name"),
    )

    op.create_table(
        "audit",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", audit_type, nullable=False, server_default="full"),
        sa.Column("status", audit_status, nullable=False, server_default="pending"),
        sa.Column("score", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("parameters", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.ForeignKeyConstraint(["project_id"], ["project.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "keyword",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("keyword", sa.String(length=255), nullable=False),
        sa.Column("intent", keyword_intent, nullable=True),
        sa.Column("value_estimate", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["project.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_keyword_project_id"), "keyword", ["project_id"], unique=False)

    op.create_table(
        "action",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(length=100), nullable=False),
        sa.Column("target", sa.String(length=500), nullable=True),
        sa.Column("ai_proposal", sa.Text(), nullable=True),
        sa.Column("status", action_status, nullable=False, server_default="draft"),
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["project.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_action_project_id"), "action", ["project_id"], unique=False)

    op.create_table(
        "report",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("html_url", sa.String(length=1024), nullable=True),
        sa.Column("pdf_url", sa.String(length=1024), nullable=True),
        sa.Column("summary", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["project.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_report_project_id"), "report", ["project_id"], unique=False)

    op.create_table(
        "reputation_score",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("score", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("drivers", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("measured_on", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["project.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "mention",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source", reputation_source, nullable=False, server_default="serp"),
        sa.Column("url", sa.String(length=1024), nullable=False),
        sa.Column("sentiment", sa.String(length=30), nullable=True),
        sa.Column("visibility", sa.Integer(), nullable=True),
        sa.Column("serp_position", sa.Integer(), nullable=True),
        sa.Column("excerpt", sa.Text(), nullable=True),
        sa.Column("metadata_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.ForeignKeyConstraint(["project_id"], ["project.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_mention_project_id"), "mention", ["project_id"], unique=False)

    op.create_table(
        "audit_item",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("audit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("url", sa.String(length=1024), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("severity", audit_item_severity, nullable=False, server_default="medium"),
        sa.Column("issue_code", sa.String(length=100), nullable=False),
        sa.Column("summary", sa.String(length=500), nullable=True),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("recommendation", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["audit_id"], ["audit.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_audit_item_audit_id"), "audit_item", ["audit_id"], unique=False)


def downgrade() -> None:
    reputation_source = sa.Enum("serp", "social", "news", "forum", name="reputation_source")
    audit_item_severity = sa.Enum("critical", "high", "medium", "low", "info", name="audit_item_severity")
    audit_status = sa.Enum("pending", "running", "completed", "failed", "cancelled", name="audit_status")
    audit_type = sa.Enum("full", "technical", "content", "reputation", "custom", name="audit_type")
    action_status = sa.Enum("draft", "proposed", "approved", "applied", "rolled_back", name="action_status")
    keyword_intent = sa.Enum(
        "informational", "transactional", "navigational", "commercial", name="keyword_intent"
    )
    project_status = sa.Enum("active", "paused", "archived", name="project_status")
    user_role = sa.Enum("owner", "admin", "editor", "viewer", name="user_role")
    account_plan = sa.Enum(
        "free", "starter", "pro", "agency", "enterprise", name="account_plan"
    )

    op.drop_index(op.f("ix_audit_item_audit_id"), table_name="audit_item")
    op.drop_table("audit_item")

    op.drop_index(op.f("ix_mention_project_id"), table_name="mention")
    op.drop_table("mention")

    op.drop_table("reputation_score")

    op.drop_index(op.f("ix_report_project_id"), table_name="report")
    op.drop_table("report")

    op.drop_index(op.f("ix_action_project_id"), table_name="action")
    op.drop_table("action")

    op.drop_index(op.f("ix_keyword_project_id"), table_name="keyword")
    op.drop_table("keyword")

    op.drop_table("audit")

    op.drop_table("api_key")

    op.drop_table("user")

    op.drop_table("usage_event")

    op.drop_table("project")

    op.drop_table("account")

    reputation_source.drop(op.get_bind(), checkfirst=True)
    audit_item_severity.drop(op.get_bind(), checkfirst=True)
    audit_status.drop(op.get_bind(), checkfirst=True)
    audit_type.drop(op.get_bind(), checkfirst=True)
    action_status.drop(op.get_bind(), checkfirst=True)
    keyword_intent.drop(op.get_bind(), checkfirst=True)
    project_status.drop(op.get_bind(), checkfirst=True)
    user_role.drop(op.get_bind(), checkfirst=True)
    account_plan.drop(op.get_bind(), checkfirst=True)
