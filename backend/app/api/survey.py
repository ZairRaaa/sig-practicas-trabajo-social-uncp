from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.api.auth import Database, current_user, require_roles
from app.core.config import get_settings
from app.core.security import require_csrf
from app.models import Experience, Site, SurveySubmission, User
from app.schemas.survey import SubmissionInput
from app.services.questionnaire import BLOCKS, NOTICE, NOTICE_VERSION, VERSION

router = APIRouter(prefix='/api/v1/survey', tags=['Cuestionario piloto'])
Student = Annotated[User, Depends(require_roles('student'))]


@router.get('/instrument')
def instrument(response: Response, user: Annotated[User, Depends(current_user)]):
    response.headers['Cache-Control'] = 'no-store'
    return {'version': VERSION, 'is_pilot': True, 'enabled': get_settings().pilot_survey_enabled,
            'notice': NOTICE, 'blocks': BLOCKS}


@router.get('/participation')
def participation(response: Response, user: Student, session: Database):
    response.headers['Cache-Control'] = 'no-store'
    answers = session.scalars(select(SurveySubmission).where(
        SurveySubmission.user_id == user.id, SurveySubmission.version == VERSION)).all()
    submitted = {answer.target_key for answer in answers}
    rows = session.execute(select(Experience, Site).join(Site, Site.id == Experience.site_id).where(
        Experience.user_id == user.id, Experience.enabled.is_(True), Site.active.is_(True)
    ).order_by(Experience.period, Site.name)).all()
    return {'priorities_submitted': 'priorities' in submitted, 'experiences': [
        {'id': experience.id, 'site_name': site.name, 'period': experience.period,
         'is_demo': site.is_demo, 'submitted': str(experience.id) in submitted}
        for experience, site in rows
    ]}


@router.post('/submissions', status_code=201, dependencies=[Depends(require_csrf)])
def submit(data: SubmissionInput, response: Response, user: Student, session: Database):
    response.headers['Cache-Control'] = 'no-store'
    if not get_settings().pilot_survey_enabled:
        raise HTTPException(403, 'La recepción del cuestionario piloto está cerrada.')
    if data.version != VERSION:
        raise HTTPException(409, 'El instrumento cambió; vuelve a cargar el cuestionario.')
    block = BLOCKS[data.kind]
    if set(data.answers) != {item['id'] for item in block['items']}:
        raise HTTPException(422, 'Debes responder los ítems de esta versión, incluyendo no aplica cuando corresponda.')
    if data.experience_id:
        # Bloqueo de la asignación durante el envío; no confiar en IDs del navegador.
        experience = session.scalar(select(Experience).where(
            Experience.id == data.experience_id, Experience.user_id == user.id,
            Experience.enabled.is_(True)).with_for_update())
        if experience is None:
            raise HTTPException(403, 'Esta experiencia no está habilitada para tu cuenta.')
        site = session.get(Site, experience.site_id)
        if site is None or not site.active:
            raise HTTPException(403, 'La sede de esta experiencia no está activa.')
    entry = SurveySubmission(user_id=user.id, experience_id=data.experience_id,
        version=VERSION, kind=data.kind, target_key=str(data.experience_id) if data.experience_id else 'priorities',
        answers=data.answers, is_pilot=True,
        instrument_snapshot={'version': VERSION, 'block': block, 'consent': True,
                             'notice_version': NOTICE_VERSION, 'notice': NOTICE})
    session.add(entry)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, 'No se guardó el envío: puede existir una respuesta previa. Actualiza el estado antes de reenviar.') from None
    return {'id': entry.id, 'submitted_at': entry.submitted_at, 'is_pilot': True}
