"""Historial de asignaciones desde esta migración, sin inventar eventos anteriores."""
from alembic import op
import sqlalchemy as sa

revision = '0006_experience_events'
down_revision = '0005_public_source'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('experience_events',
        sa.Column('id', sa.Uuid(), primary_key=True),
        sa.Column('experience_id', sa.Uuid(), sa.ForeignKey('experiences.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('actor_id', sa.Uuid(), sa.ForeignKey('users.id', ondelete='RESTRICT')),
        sa.Column('origin', sa.String(20), nullable=False),
        sa.Column('previous_enabled', sa.Boolean()),
        sa.Column('enabled', sa.Boolean(), nullable=False),
        sa.Column('previous_reference', sa.String(250)),
        sa.Column('reference', sa.String(250), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.create_index('ix_experience_events_experience_id', 'experience_events', ['experience_id'])


def downgrade():
    op.drop_table('experience_events')
