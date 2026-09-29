"""Cuentas locales y sesiones revocables."""
from alembic import op
import sqlalchemy as sa

revision = '0003_auth'
down_revision = '0002_spatial_index'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Uuid(), primary_key=True),
        sa.Column('username', sa.String(80), nullable=False),
        sa.Column('display_name', sa.String(120), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), nullable=False, server_default='student'),
        sa.Column('active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('username', name=op.f('uq_users_username')),
        sa.CheckConstraint("role IN ('student', 'coordinator', 'admin')", name=op.f('ck_users_role')))
    op.create_table('user_sessions',
        sa.Column('token_hash', sa.String(64), primary_key=True),
        sa.Column('user_id', sa.Uuid(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False))
    op.create_index('ix_user_sessions_user_id', 'user_sessions', ['user_id'])
    op.create_index('ix_user_sessions_expires_at', 'user_sessions', ['expires_at'])


def downgrade():
    op.drop_table('user_sessions')
    op.drop_table('users')
