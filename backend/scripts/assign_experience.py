"""Habilita una experiencia por decisión del responsable local, no por autoasignación."""
import argparse
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from app.db.session import SessionLocal
from app.models import Experience, Site, User
from app.services.experiences import matching_experiences, normalize_period, record_event


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--student', required=True)
    parser.add_argument('--site', required=True, type=UUID)
    parser.add_argument('--period', required=True)
    parser.add_argument('--reference', required=True, help='Referencia de habilitación o identificación explícita de demo.')
    parser.add_argument('--disable', action='store_true')
    args = parser.parse_args()
    period, reference = normalize_period(args.period), args.reference.strip()
    if not 1 <= len(period) <= 40 or not 1 <= len(reference) <= 250:
        parser.error('Periodo: 1–40 caracteres; referencia: 1–250 caracteres.')
    try:
        with SessionLocal.begin() as session:
            user = session.scalar(select(User).where(User.username == args.student.strip().lower()))
            site = session.get(Site, args.site)
            if user is None or not user.active or user.role != 'student':
                parser.error('Se requiere una cuenta activa con rol estudiante.')
            if site is None or (not site.active and not args.disable):
                parser.error('La sede no existe o está desactivada.')
            matches = matching_experiences(session, user.id, site.id, period)
            if len(matches) > 1:
                parser.error('Hay periodos históricos equivalentes. Gestiona la asignación por su ID en la web; no se fusionaron registros.')
            experience = matches[0] if matches else None
            previous_enabled = experience.enabled if experience else None
            previous_reference = experience.authorization_reference if experience else None
            if experience is None:
                if args.disable:
                    parser.error('No existe esa asignación para deshabilitarla.')
                experience = Experience(user_id=user.id, site_id=site.id, period=period,
                                        authorization_reference=reference, enabled=True)
                session.add(experience)
                session.flush()
            else:
                experience.enabled = not args.disable
                experience.authorization_reference = reference
            record_event(session, experience, actor_id=None, origin='local_script',
                         previous_enabled=previous_enabled, previous_reference=previous_reference)
        print('Asignación deshabilitada.' if args.disable else 'Experiencia habilitada; no se crearon respuestas.')
    except SQLAlchemyError:
        parser.exit(1, 'No se completó la asignación. Revisa conexión, migraciones o duplicados.\n')


if __name__ == '__main__':
    main()
