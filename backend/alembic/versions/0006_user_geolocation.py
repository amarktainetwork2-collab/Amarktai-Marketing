"""Add geo_lat and geo_lon columns to users

Supports the PATCH /users/me/location endpoint added in the previous
session (PWA geolocation capture for AI lead targeting / posting-time
optimisation).

Revision ID: 0006_user_geolocation
Revises: 0005_business_groups
Create Date: 2026-03-03
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0006_user_geolocation"
down_revision: Union[str, None] = "0005_business_groups"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("geo_lat", sa.Float(), nullable=True))
    op.add_column("users", sa.Column("geo_lon", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "geo_lon")
    op.drop_column("users", "geo_lat")
