from uuid import UUID
from sqlalchemy import func, select
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
        Site.verification_status, Site.verified_at, Site.is_demo,
    ).join(Institution, Site.institution_id == Institution.id).outerjoin(
        District, Site.district_ubigeo == District.ubigeo
    ).where(Site.active.is_(True))


def list_sites(session: Session, *, query: str | None, district: str | None,
               category: str | None, limit: int, offset: int) -> SitePage:
    statement = site_query()
    if query and query.strip():
        # autoescape convierte % y _ en caracteres literales para la búsqueda.
        statement = statement.where(Site.name.icontains(query.strip(), autoescape=True))
    if district:
        statement = statement.where(Site.district_ubigeo == district)
    if category:
        statement = statement.where(Institution.category == category)
    total = session.scalar(select(func.count()).select_from(statement.subquery())) or 0
    rows = session.execute(
        statement.order_by(Site.name, Site.id).limit(limit).offset(offset)
    ).mappings().all()
    return SitePage(items=[SiteRead.model_validate(row) for row in rows],
                    total=total, limit=limit, offset=offset)


def get_site(session: Session, site_id: UUID) -> SiteRead | None:
    row = session.execute(site_query().where(Site.id == site_id)).mappings().one_or_none()
    return SiteRead.model_validate(row) if row is not None else None
