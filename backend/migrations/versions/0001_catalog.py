"""Catálogo inicial. PostGIS debe habilitarlo un administrador antes de migrar."""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

revision = '0001_catalog'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute('SELECT PostGIS_Version()')
    op.create_table('districts',
        sa.Column('ubigeo', sa.String(6), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.CheckConstraint("ubigeo ~ '^[0-9]{6}$'", name=op.f('ck_districts_ubigeo_format')))
    op.create_table('institutions',
        sa.Column('id', sa.Uuid(), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('category', sa.String(80), nullable=False),
        sa.CheckConstraint("length(trim(name)) > 0", name=op.f('ck_institutions_name_not_blank')))
    op.create_index('ix_institutions_category', 'institutions', ['category'])
    op.create_table('sites',
        sa.Column('id', sa.Uuid(), primary_key=True),
        sa.Column('institution_id', sa.Uuid(), sa.ForeignKey('institutions.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('district_ubigeo', sa.String(6), sa.ForeignKey('districts.ubigeo', ondelete='RESTRICT')),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('address', sa.String(300)),
        sa.Column('description', sa.Text()),
        sa.Column('location', Geometry('POINT', srid=4326, spatial_index=False), nullable=False),
        sa.Column('source', sa.Text()),
        sa.Column('verification_status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('verified_at', sa.DateTime(timezone=True)),
        sa.Column('active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('is_demo', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("length(trim(name)) > 0", name=op.f('ck_sites_name_not_blank')),
        sa.CheckConstraint("verification_status IN ('pending', 'verified')", name=op.f('ck_sites_verification_status')),
        sa.CheckConstraint("verification_status <> 'verified' OR (verified_at IS NOT NULL AND source IS NOT NULL AND length(trim(source)) > 0)", name=op.f('ck_sites_verified_evidence')),
        sa.CheckConstraint('NOT ST_IsEmpty(location) AND ST_X(location) BETWEEN -180 AND 180 AND ST_Y(location) BETWEEN -90 AND 90', name=op.f('ck_sites_coordinates_range')))
    op.create_index('ix_sites_institution_id', 'sites', ['institution_id'])
    op.create_index('ix_sites_district_ubigeo', 'sites', ['district_ubigeo'])
    op.create_index('idx_sites_location', 'sites', ['location'], postgresql_using='gist')


def downgrade():
    # Elimina el catálogo y sus datos; no ejecutar sobre datos que se necesiten conservar.
    op.drop_table('sites')
    op.drop_table('institutions')
    op.drop_table('districts')
    # La extensión PostGIS pertenece a la base, no se elimina desde esta migración.
