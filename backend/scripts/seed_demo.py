"""Carga explícita e idempotente de ejemplos. No sobrescribe registros existentes."""
import argparse
from uuid import NAMESPACE_URL, uuid5
from geoalchemy2 import WKTElement
from sqlalchemy.exc import SQLAlchemyError
from app.db.session import SessionLocal
from app.models import District, Institution, Site

DISTRICTS = {
    '990001': 'El Tambo (demo)',
    '990002': 'Huancayo (demo)',
    '990003': 'Chilca (demo)',
}
# Códigos sintéticos, no son UBIGEO oficiales. Nunca usar para análisis institucional.
SITES = [
    ('aprender', 'Aprender', 'Educación', '990001', -12.047, -75.218),
    ('cuidar', 'Cuidar', 'Salud', '990001', -12.052, -75.226),
    ('encuentro', 'Encuentro', 'Comunidad', '990002', -12.066, -75.205),
    ('bienestar', 'Bienestar', 'Salud', '990002', -12.075, -75.212),
    ('crecer', 'Crecer', 'Educación', '990003', -12.086, -75.204),
    ('vinculos', 'Vínculos', 'Comunidad', '990003', -12.094, -75.211),
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--confirm-demo', action='store_true',
                        help='Confirma que se desean insertar datos ficticios en la base configurada.')
    if not parser.parse_args().confirm_demo:
        parser.error('La carga requiere --confirm-demo. No se modificó la base.')
    created = 0
    try:
        with SessionLocal.begin() as session:
            for code, name in DISTRICTS.items():
                existing = session.get(District, code)
                if existing is None:
                    session.add(District(ubigeo=code, name=name))
                elif existing.name != name:
                    raise ValueError('Un código de demostración ya pertenece a otro distrito.')
            session.flush()
            for key, label, category, district, lat, lon in SITES:
                institution_id = uuid5(NAMESPACE_URL, f'territorio-demo/institution/{key}')
                site_id = uuid5(NAMESPACE_URL, f'territorio-demo/site/{key}')
                name = f'Centro demo · {label}'
                institution = session.get(Institution, institution_id)
                if institution is None:
                    session.add(Institution(id=institution_id, name=name, category=category))
                    session.flush()
                elif institution.name != name or institution.category != category:
                    raise ValueError('Una institución de demostración fue modificada; no se sobrescribirá.')
                site = session.get(Site, site_id)
                if site is not None:
                    if not site.is_demo or site.institution_id != institution_id:
                        raise ValueError('Un identificador de demostración está ocupado por otro registro.')
                    continue
                session.add(Site(
                    id=site_id, institution_id=institution_id, name=name,
                    district_ubigeo=district,
                    description=f'Sede ficticia para demostrar la consulta de centros de {category.lower()}.',
                    location=WKTElement(f'POINT({lon} {lat})', srid=4326),
                    source='Fixture sintético del proyecto. No representa una institución real.',
                    is_demo=True, active=True, verification_status='pending',
                ))
                created += 1
        print(f'Carga terminada: {created} sedes ficticias nuevas. No se sobrescribieron registros.')
    except (SQLAlchemyError, ValueError) as error:
        message = str(error) if isinstance(error, ValueError) else 'Revisa conexión, permisos y migraciones.'
        parser.exit(1, f'No se completó la carga; la transacción se revirtió. {message}\n')


if __name__ == '__main__':
    main()
