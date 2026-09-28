from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, text
from sqlalchemy.orm import Session
from app.db.session import get_session
from app.models import District
from app.schemas.catalog import DistrictRead, SitePage, SiteRead
from app.services.catalog import get_site, list_sites

router = APIRouter(prefix='/api/v1')
Database = Annotated[Session, Depends(get_session)]


@router.get('/health', tags=['Estado'])
def health() -> dict[str, str]:
    """Indica que la API responde, sin afirmar conexión a la base."""
    return {'status': 'ok', 'service': 'territorio-api'}


@router.get('/ready', tags=['Estado'])
def ready(session: Database) -> dict[str, str]:
    session.execute(text('SELECT PostGIS_Version()')).scalar_one()
    session.execute(text('SELECT id FROM sites LIMIT 0'))
    return {'status': 'ready', 'database': 'connected', 'spatial': 'available'}


@router.get('/sites', response_model=SitePage, tags=['Catálogo'])
def sites(
    session: Database,
    q: Annotated[str | None, Query(max_length=150)] = None,
    district: Annotated[str | None, Query(pattern=r'^\d{6}$')] = None,
    category: Annotated[str | None, Query(max_length=80)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 30,
    offset: Annotated[int, Query(ge=0, le=100000)] = 0,
) -> SitePage:
    return list_sites(session, query=q, district=district, category=category,
                      limit=limit, offset=offset)


@router.get('/sites/{site_id}', response_model=SiteRead, tags=['Catálogo'])
def site(site_id: UUID, session: Database) -> SiteRead:
    result = get_site(session, site_id)
    if result is None:
        raise HTTPException(status_code=404, detail='Sede no encontrada.')
    return result


@router.get('/districts', response_model=list[DistrictRead], tags=['Catálogo'])
def districts(session: Database) -> list[DistrictRead]:
    rows = session.execute(select(District.ubigeo, District.name).order_by(District.name)).mappings()
    return [DistrictRead.model_validate(row) for row in rows]
