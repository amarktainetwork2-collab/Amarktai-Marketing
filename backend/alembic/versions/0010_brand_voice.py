"""Add brand_voice column to webapps table."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0010_brand_voice"
down_revision: Union[str, None] = "0009_phase2_missing_cols"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("webapps", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("brand_voice", sa.Text(), nullable=True)
        )


def downgrade() -> None:
    with op.batch_alter_table("webapps", schema=None) as batch_op:
        batch_op.drop_column("brand_voice")
