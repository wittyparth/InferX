"""Add OAuth fields to User model

Revision ID: f4a8b9c1d2e3
Revises: e3725ab8ee77
Create Date: 2025-10-31 12:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "f4a8b9c1d2e3"
down_revision = "e3725ab8ee77"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make hashed_password nullable for OAuth users
    op.alter_column(
        "users", "hashed_password", existing_type=sa.VARCHAR(length=255), nullable=True
    )

    # Add OAuth provider field
    op.add_column(
        "users", sa.Column("oauth_provider", sa.String(length=50), nullable=True)
    )
    op.create_index(
        op.f("ix_users_oauth_provider"), "users", ["oauth_provider"], unique=False
    )

    # Add OAuth ID field
    op.add_column("users", sa.Column("oauth_id", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_users_oauth_id"), "users", ["oauth_id"], unique=False)

    # Add avatar URL field
    op.add_column(
        "users", sa.Column("avatar_url", sa.String(length=512), nullable=True)
    )

    # Create unique constraint on oauth_provider + oauth_id combination
    op.create_index(
        "ix_users_oauth_provider_id",
        "users",
        ["oauth_provider", "oauth_id"],
        unique=True,
    )


def downgrade() -> None:
    # Drop indexes and columns
    op.drop_index("ix_users_oauth_provider_id", table_name="users")
    op.drop_column("users", "avatar_url")
    op.drop_index(op.f("ix_users_oauth_id"), table_name="users")
    op.drop_column("users", "oauth_id")
    op.drop_index(op.f("ix_users_oauth_provider"), table_name="users")
    op.drop_column("users", "oauth_provider")

    # Make hashed_password non-nullable again
    op.alter_column(
        "users", "hashed_password", existing_type=sa.VARCHAR(length=255), nullable=False
    )
