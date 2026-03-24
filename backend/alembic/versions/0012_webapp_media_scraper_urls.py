"""Add scraper_source_urls and media_assets columns to webapps table."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0012_webapp_media_scraper_urls"
down_revision: Union[str, None] = "0011_webapp_market_content_goals"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("webapps", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("scraper_source_urls", sa.JSON(), nullable=True)
        )
        batch_op.add_column(
            sa.Column("media_assets", sa.JSON(), nullable=True)
        )


def downgrade() -> None:
    with op.batch_alter_table("webapps", schema=None) as batch_op:
        batch_op.drop_column("media_assets")
        batch_op.drop_column("scraper_source_urls")
