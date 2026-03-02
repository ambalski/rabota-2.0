"""Add employers table

Revision ID: 002
Revises: 001
Create Date: 2025-03-02

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "employers",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("company_name_anonymized", sa.String(length=255), nullable=True),
        sa.Column("industry", sa.String(length=255), nullable=True),
        sa.Column("size", sa.String(length=50), nullable=True),
        sa.Column("stage", sa.String(length=50), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("timezone", sa.String(length=100), nullable=True),
        sa.Column("remote_policy", sa.String(length=100), nullable=True),
        sa.Column("compensation_bracket", sa.String(length=100), nullable=True),
        sa.Column("privacy_settings", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_employers_user_id", "employers", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_employers_user_id", table_name="employers")
    op.drop_table("employers")

