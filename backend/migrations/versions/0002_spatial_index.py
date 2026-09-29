"""Índice de expresión para consultas geográficas en metros."""
from alembic import op

revision = '0002_spatial_index'
down_revision = '0001_catalog'
branch_labels = None
depends_on = None


def upgrade():
    op.execute('CREATE INDEX idx_sites_location_geography ON sites USING gist ((location::geography))')


def downgrade():
    op.drop_index('idx_sites_location_geography', table_name='sites')
