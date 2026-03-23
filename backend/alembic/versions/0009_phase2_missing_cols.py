"""Phase 2 — add missing columns for settings, contact table, and provider metadata."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0009_phase2_missing_cols"
down_revision: Union[str, None] = "0008_jwt_auth"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users: phase-2 preferences & quota columns ────────────────────────────
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("plan_tier", sa.String(length=32), nullable=True, server_default="free"))
        batch_op.add_column(sa.Column("plan_quota_content", sa.Integer(), nullable=True, server_default="50"))
        batch_op.add_column(sa.Column("plan_quota_used", sa.Integer(), nullable=True, server_default="0"))
        batch_op.add_column(sa.Column("notification_email", sa.Boolean(), nullable=True, server_default=sa.true()))
        batch_op.add_column(sa.Column("notification_digest", sa.Boolean(), nullable=True, server_default=sa.true()))
        batch_op.add_column(sa.Column("settings_json", sa.Text(), nullable=True))

    # ── contact_messages table ────────────────────────────────────────────────
    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("contact_messages")

    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("settings_json")
        batch_op.drop_column("notification_digest")
        batch_op.drop_column("notification_email")
        batch_op.drop_column("plan_quota_used")
        batch_op.drop_column("plan_quota_content")
        batch_op.drop_column("plan_tier")
