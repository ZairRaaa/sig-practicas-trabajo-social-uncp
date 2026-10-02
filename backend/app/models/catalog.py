from datetime import datetime
from uuid import UUID, uuid4

from geoalchemy2 import Geography, Geometry, WKBElement
from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, String, Text, cast, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class District(Base):
    __tablename__ = 'districts'
    __table_args__ = (CheckConstraint("ubigeo ~ '^[0-9]{6}$'", name='ubigeo_format'),)

    ubigeo: Mapped[str] = mapped_column(String(6), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    # Los límites se añadirán al obtener cartografía con fuente y versión.


class Institution(Base):
    __tablename__ = 'institutions'
    __table_args__ = (
        CheckConstraint("length(trim(name)) > 0", name='name_not_blank'),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(80), index=True)


class Site(Base):
    __tablename__ = 'sites'
    __table_args__ = (
        CheckConstraint("length(trim(name)) > 0", name='name_not_blank'),
        CheckConstraint(
            "verification_status IN ('pending', 'verified')", name='verification_status'
        ),
        CheckConstraint(
            "verification_status <> 'verified' OR "
            "(verified_at IS NOT NULL AND source IS NOT NULL AND length(trim(source)) > 0)",
            name='verified_evidence',
        ),
        CheckConstraint(
            'NOT ST_IsEmpty(location) AND ST_X(location) BETWEEN -180 AND 180 '
            'AND ST_Y(location) BETWEEN -90 AND 90', name='coordinates_range'
        ),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    institution_id: Mapped[UUID] = mapped_column(
        ForeignKey('institutions.id', ondelete='RESTRICT'), index=True
    )
    district_ubigeo: Mapped[str | None] = mapped_column(
        ForeignKey('districts.ubigeo', ondelete='RESTRICT'), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    address: Mapped[str | None] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text)
    location: Mapped[WKBElement] = mapped_column(Geometry('POINT', srid=4326))
    source: Mapped[str | None] = mapped_column(Text)
    # Solo texto revisado para publicación; source conserva la evidencia interna.
    public_source: Mapped[str | None] = mapped_column(String(1000))
    verification_status: Mapped[str] = mapped_column(String(20), server_default='pending')
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    active: Mapped[bool] = mapped_column(Boolean, server_default='true')
    is_demo: Mapped[bool] = mapped_column(Boolean, server_default='false')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


Index('idx_sites_location_geography', cast(Site.location, Geography(srid=4326)), postgresql_using='gist')
