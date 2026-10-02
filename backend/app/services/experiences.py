"""Normalización y trazabilidad compartidas por la API y los comandos locales."""
import re
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Experience, ExperienceEvent


def normalize_period(value: str) -> str:
    value = ' '.join(value.strip().upper().split())
    value = value.replace('–', '-').replace('—', '-')
    semester = re.fullmatch(r'(\d{4})\s*[-/]\s*(I|II|1|2)', value)
    if semester:
        year, part = semester.groups()
        return f"{year}-{'I' if part in ('I', '1') else 'II'}"
    return value


def matching_experiences(session: Session, user_id: UUID, site_id: UUID, period: str):
    # Detectar también variantes históricas sin reescribir ni fusionar respuestas.
    rows = session.scalars(select(Experience).where(
        Experience.user_id == user_id, Experience.site_id == site_id
    ).order_by(Experience.id).with_for_update()).all()
    return [row for row in rows if normalize_period(row.period) == normalize_period(period)]


def record_event(session: Session, entry: Experience, *, actor_id: UUID | None,
                 origin: str, previous_enabled: bool | None, previous_reference: str | None):
    session.add(ExperienceEvent(
        experience_id=entry.id, actor_id=actor_id, origin=origin,
        previous_enabled=previous_enabled, enabled=entry.enabled,
        previous_reference=previous_reference, reference=entry.authorization_reference,
    ))
