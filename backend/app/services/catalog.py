from uuid import UUID
import unicodedata
from sqlalchemy import cast, func, select
from geoalchemy2 import Geography
from sqlalchemy.orm import Session
from app.models import District, Institution, Site
from app.schemas.catalog import SitePage, SiteRead


def site_query():
    return select(
        Site.id, Institution.name.label('institution_name'), Site.name,
        Institution.category, Site.district_ubigeo,
        District.name.label('district_name'), Site.address, Site.description,
        func.ST_X(Site.location).label('longitude'),
        func.ST_Y(Site.location).label('latitude'),
        Site.verification_status, Site.verified_at, Site.public_source, Site.is_demo,
    ).join(Institution, Site.institution_id == Institution.id).outerjoin(
        District, Site.district_ubigeo == District.ubigeo
    ).where(Site.active.is_(True))


def list_sites(session: Session, *, query: str | None, district: str | None,
               category: str | None, limit: int, offset: int,
               origin: tuple[float, float] | None = None,
               radius_m: float | None = None) -> SitePage:
    statement = site_query()
    distance = None
    if origin is not None:
        if radius_m is None:
            raise ValueError('El radio es obligatorio cuando se proporciona un origen.')
        latitude, longitude = origin
        point = cast(func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326), Geography(srid=4326))
        location = cast(Site.location, Geography(srid=4326))
        distance = func.ST_Distance(location, point).label('distance_m')
        statement = statement.add_columns(distance).where(func.ST_DWithin(location, point, radius_m))
    if query and query.strip():
        # Búsqueda española sin tildes, sin exigir la extensión unaccent.
        search = ''.join(char for char in unicodedata.normalize('NFD', query.strip().lower())
                         if not unicodedata.combining(char))
        haystack = func.lower(func.concat_ws(' ', Site.name, Institution.name,
                                             Institution.category, District.name))
        normalized = func.translate(haystack, 'áéíóúüñ', 'aeiouun')
        statement = statement.where(normalized.contains(search, autoescape=True))
    if district:
        statement = statement.where(Site.district_ubigeo == district)
    if category:
        statement = statement.where(Institution.category == category)
    total = session.scalar(select(func.count()).select_from(statement.subquery())) or 0
    ordering = (distance, Site.id) if distance is not None else (Site.name, Site.id)
    rows = session.execute(
        statement.order_by(*ordering).limit(limit).offset(offset)
    ).mappings().all()
    return SitePage(items=[SiteRead.model_validate(row) for row in rows],
                    total=total, limit=limit, offset=offset)


def get_site(session: Session, site_id: UUID) -> SiteRead | None:
    row = session.execute(site_query().where(Site.id == site_id)).mappings().one_or_none()
    return SiteRead.model_validate(row) if row is not None else None
