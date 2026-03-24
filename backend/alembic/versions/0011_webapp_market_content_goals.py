"""Add market_location and content_goals columns to webapps table."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0011_webapp_market_content_goals"
down_revision: Union[str, None] = "0010_brand_voice"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("webapps", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("market_location", sa.String(255), nullable=True)
        )
        batch_op.add_column(
            sa.Column("content_goals", sa.Text(), nullable=True)
        )


def downgrade() -> None:
    with op.batch_alter_table("webapps", schema=None) as batch_op:
        batch_op.drop_column("content_goals")
        batch_op.drop_column("market_location")
