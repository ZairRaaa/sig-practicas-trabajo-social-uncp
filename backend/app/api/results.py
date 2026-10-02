from datetime import datetime, timezone
from typing import Literal
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, Response
from sqlalchemy import select
from app.api.auth import Database
from app.api.management import Staff
from app.models import Experience, Site, SurveySubmission
from app.services.questionnaire import BLOCKS, VERSION

router = APIRouter(prefix='/api/v1/results', tags=['Resultados piloto'])


@router.get('/options')
def options(response: Response, user: Staff, session: Database):
    response.headers['Cache-Control'] = 'no-store'
    rows = session.execute(select(Site.id, Site.name, Site.is_demo, Experience.period)
        .join(Experience, Experience.site_id == Site.id)
        .join(SurveySubmission, SurveySubmission.experience_id == Experience.id)
        .where(SurveySubmission.version == VERSION, SurveySubmission.is_pilot.is_(True),
               SurveySubmission.kind == 'experience').distinct()
        .order_by(Site.name, Site.id, Experience.period)).all()
    return {'version': VERSION, 'experiences': [
        {'site_id': row.id, 'site_name': row.name, 'is_demo': row.is_demo, 'period': row.period}
        for row in rows]}


@router.get('/summary')
def summary(response: Response, user: Staff, session: Database,
            kind: Literal['priorities', 'experience'],
            scope: Literal['demo', 'non_demo'] = 'demo', site_id: UUID | None = None,
            period: str | None = Query(default=None, min_length=1, max_length=40)):
    response.headers['Cache-Control'] = 'no-store'
    if kind == 'priorities' and (site_id is not None or period is not None):
        raise HTTPException(422, 'El bloque de prioridades no se filtra por sede ni periodo de prácticas.')
    statement = select(SurveySubmission.user_id, SurveySubmission.answers, SurveySubmission.instrument_snapshot).where(
        SurveySubmission.version == VERSION, SurveySubmission.is_pilot.is_(True), SurveySubmission.kind == kind)
    if kind == 'experience':
        statement = statement.join(Experience, Experience.id == SurveySubmission.experience_id).join(Site, Site.id == Experience.site_id)
        statement = statement.where(Site.is_demo.is_(scope == 'demo'))
        if site_id is not None:
            statement = statement.where(Site.id == site_id)
        if period is not None:
            statement = statement.where(Experience.period == period)
    block = BLOCKS[kind]
    counts = {item['id']: [0] * 5 for item in block['items']}
    na = {item['id']: 0 for item in block['items']}
    respondents = set()
    submissions = excluded = 0
    # Solo se devuelven agregados; las identidades se usan para contar participantes únicos.
    for row in session.execute(statement.execution_options(yield_per=500)):
        answers, snapshot = row.answers, row.instrument_snapshot
        if (not isinstance(snapshot, dict) or snapshot.get('block') != block
                or not isinstance(answers, dict) or set(answers) != set(counts)
                or any(value is not None and (type(value) is not int or not 1 <= value <= 5)
                       for value in answers.values())):
            excluded += 1
            continue
        submissions += 1
        respondents.add(row.user_id)
        for key, value in answers.items():
            if value is None:
                na[key] += 1
            else:
                counts[key][value - 1] += 1
    items = []
    for item in block['items']:
        values = counts[item['id']]
        valid = sum(values)
        items.append({**item, 'valid': valid, 'not_applicable': na[item['id']],
                      'distribution': [{'score': index + 1, 'label': block['scale'][index], 'count': count,
                                        'percent': round(count * 100 / valid, 1) if valid else None}
                                       for index, count in enumerate(values)]})
    return {'version': VERSION, 'is_pilot': True, 'kind': kind, 'title': block['title'],
            'scope': scope if kind == 'experience' else None,
            'submissions': submissions, 'participants': len(respondents), 'excluded': excluded,
            'generated_at': datetime.now(timezone.utc), 'items': items}
