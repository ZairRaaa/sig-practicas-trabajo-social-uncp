"""Referencia pública independiente de la evidencia interna de verificación."""
from alembic import op
import sqlalchemy as sa

revision = '0005_public_source'
down_revision = '0004_surveys'
branch_labels = None
depends_on = None


def upgrade():
    # No copiar source: puede contener referencias internas no autorizadas.
    op.add_column('sites', sa.Column('public_source', sa.String(1000), nullable=True))


def downgrade():
    op.drop_column('sites', 'public_source')
