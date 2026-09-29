"""Experiencias habilitadas y respuestas piloto versionadas."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0004_surveys'
down_revision = '0003_auth'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('experiences',
        sa.Column('id', sa.Uuid(), primary_key=True),
        sa.Column('user_id', sa.Uuid(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('site_id', sa.Uuid(), sa.ForeignKey('sites.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('period', sa.String(40), nullable=False),
        sa.Column('authorization_reference', sa.String(250), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'site_id', 'period', name='uq_experience_assignment'))
    op.create_index('ix_experiences_user_id', 'experiences', ['user_id'])
    op.create_table('survey_submissions',
        sa.Column('id', sa.Uuid(), primary_key=True),
        sa.Column('user_id', sa.Uuid(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('experience_id', sa.Uuid(), sa.ForeignKey('experiences.id', ondelete='RESTRICT')),
        sa.Column('version', sa.String(40), nullable=False),
        sa.Column('kind', sa.String(20), nullable=False),
        sa.Column('target_key', sa.String(40), nullable=False),
        sa.Column('answers', postgresql.JSONB(), nullable=False),
        sa.Column('instrument_snapshot', postgresql.JSONB(), nullable=False),
        sa.Column('is_pilot', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'version', 'kind', 'target_key', name='uq_survey_submission'),
        sa.CheckConstraint("(kind = 'priorities' AND experience_id IS NULL AND target_key = 'priorities') OR (kind = 'experience' AND experience_id IS NOT NULL AND target_key = experience_id::text)", name=op.f('ck_survey_submissions_survey_target')))
    op.create_index('ix_survey_submissions_user_id', 'survey_submissions', ['user_id'])


def downgrade():
    op.drop_table('survey_submissions')
    op.drop_table('experiences')
