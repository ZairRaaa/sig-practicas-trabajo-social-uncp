from typing import Annotated, Literal
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from app.api.auth import Database, require_roles
from app.core.security import require_csrf
from app.models import Experience, Site, User
from app.schemas.management import ExperienceCreate, ExperienceState

router = APIRouter(prefix='/api/v1/management', tags=['Gestión de experiencias'])
Staff = Annotated[User, Depends(require_roles('admin', 'coordinator'))]


@router.get('/options')
def options(response: Response, user: Staff, session: Database,
            kind: Literal['students', 'sites'], q: str = Query(default='', max_length=100)):
    response.headers['Cache-Control'] = 'no-store'
    term = q.strip()
    if kind == 'students':
        statement = select(User).where(User.role == 'student', User.active.is_(True))
        if term:
            statement = statement.where(or_(User.display_name.icontains(term, autoescape=True),
                                            User.username.icontains(term, autoescape=True)))
        rows = session.scalars(statement.order_by(User.display_name, User.id).limit(51)).all()
        items = [{'id': row.id, 'label': row.display_name, 'detail': row.username} for row in rows[:50]]
    else:
        statement = select(Site).where(Site.active.is_(True))
        if term:
            statement = statement.where(Site.name.icontains(term, autoescape=True))
        rows = session.scalars(statement.order_by(Site.name, Site.id).limit(51)).all()
        items = [{'id': row.id, 'label': row.name,
                  'detail': 'Sede demo' if row.is_demo else 'Sede del catálogo'} for row in rows[:50]]
    return {'items': items, 'has_more': len(rows) > 50}


@router.get('/experiences')
def experiences(response: Response, user: Staff, session: Database,
                q: str = Query(default='', max_length=100), enabled: bool | None = None,
                offset: int = Query(default=0, ge=0), limit: int = Query(default=10, ge=1, le=50)):
    response.headers['Cache-Control'] = 'no-store'
    statement = select(Experience, User, Site).join(User, User.id == Experience.user_id).join(Site, Site.id == Experience.site_id)
    if q.strip():
        term = q.strip()
        statement = statement.where(or_(User.display_name.icontains(term, autoescape=True),
            User.username.icontains(term, autoescape=True), Site.name.icontains(term, autoescape=True),
            Experience.period.icontains(term, autoescape=True)))
    if enabled is not None:
        statement = statement.where(Experience.enabled == enabled)
    total = session.scalar(select(func.count()).select_from(statement.subquery()))
    rows = session.execute(statement.order_by(Experience.created_at.desc(), Experience.id).offset(offset).limit(limit)).all()
    return {'total': total, 'items': [
        {'id': experience.id, 'student_name': student.display_name, 'username': student.username,
         'site_name': site.name, 'period': experience.period, 'enabled': experience.enabled,
         'eligible': student.active and student.role == 'student' and site.active,
         'is_demo': site.is_demo, 'reference': experience.authorization_reference}
        for experience, student, site in rows]}


@router.post('/experiences', status_code=201, dependencies=[Depends(require_csrf)])
def create_experience(data: ExperienceCreate, response: Response, user: Staff, session: Database):
    response.headers['Cache-Control'] = 'no-store'
    student = session.get(User, data.student_id)
    site = session.get(Site, data.site_id)
    if student is None or not student.active or student.role != 'student' or site is None or not site.active:
        raise HTTPException(422, 'Selecciona una estudiante y una sede activas.')
    entry = Experience(user_id=student.id, site_id=site.id, period=data.period,
                       authorization_reference=data.reference, enabled=True)
    session.add(entry)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, 'Ya existe esa experiencia. Actualiza el listado para gestionarla.') from None
    return {'id': entry.id, 'enabled': entry.enabled}


@router.post('/experiences/{experience_id}/state', dependencies=[Depends(require_csrf)])
def change_state(experience_id: UUID, data: ExperienceState, response: Response, user: Staff, session: Database):
    response.headers['Cache-Control'] = 'no-store'
    entry = session.scalar(select(Experience).where(Experience.id == experience_id).with_for_update())
    if entry is None:
        raise HTTPException(404, 'La experiencia no existe.')
    if entry.enabled != data.expected_enabled:
        raise HTTPException(409, 'El estado cambió. Actualiza el listado.')
    if data.enabled:
        student = session.get(User, entry.user_id)
        site = session.get(Site, entry.site_id)
        if student is None or not student.active or student.role != 'student' or site is None or not site.active:
            raise HTTPException(422, 'La estudiante o sede ya no está activa.')
    entry.enabled = data.enabled
    entry.authorization_reference = data.reference
    session.commit()
    return {'id': entry.id, 'enabled': entry.enabled}
