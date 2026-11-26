"""Prepara y carga sedes reales del Formato 01 con una vista previa por ficha."""
import argparse
import csv
from collections import defaultdict
from datetime import datetime, time, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from scripts.site_import_csv import SiteRow, WORK_CODE, create_template, normalized, read_rows


LIMA = timezone(timedelta(hours=-5))
EVIDENCE_FIELDS = {
    'departamento': 'Departamento',
    'provincia': 'Provincia',
    'distrito': 'Distrito indicado en la ficha',
    'fuente_ubigeo': 'Fuente del UBIGEO',
    'fuente_institucional': 'Fuente institucional',
    'fuente_ubicacion': 'Fuente de ubicación',
    'enlace_ubicacion': 'Enlace de ubicación',
    'fecha_consulta': 'Fecha de consulta',
    'ubicacion_confirmada': 'Ubicación confirmada',
    'fecha_revision': 'Fecha de revisión',
    'responsable_revision': 'Responsable de revisión',
    'sustento_publicacion': 'Sustento de publicación',
    'observaciones': 'Observaciones',
}


def site_fields(row: SiteRow) -> dict:
    values = row.values
    source = [f'Código de ficha: {normalized(row.code)}']
    source.extend(f'{label}: {values[key]}' for key, label in EVIDENCE_FIELDS.items() if values[key])
    return {
        'name': values['sede'],
        'district_ubigeo': values['ubigeo'] or None,
        'address': values['direccion'],
        'description': values['descripcion'],
        'source': '\n'.join(source),
        'public_source': values['referencia_publica'] or None,
        'active': row.active,
        'verification_status': 'verified' if row.verified else 'pending',
        'verified_at': datetime.combine(row.review_date, time.min, LIMA)
        if row.verified and row.review_date else None,
        'is_demo': False,
    }


def report(rows: list[SiteRow]) -> int:
    errors = existing = 0
    for row in rows:
        code = f' [{row.code}]' if WORK_CODE.fullmatch(row.code) else ''
        if row.errors:
            state = 'NECESITA CORRECCIONES'
            errors += 1
        elif row.already_loaded:
            state = f'YA CARGADA · UUID {row.site_id}'
            existing += 1
        else:
            visibility = 'visible en el catálogo' if row.active else 'inactiva'
            state = f'LISTA · {visibility} · UUID {row.site_id}'
        print(f'Línea {row.line}{code} · {state}')
        for error in row.errors:
            print(f'  - {error}')
        for warning in row.warnings:
            print(f'  - Aviso: {warning}')
    print(f'Listas: {len(rows) - errors - existing} | Con correcciones: {errors} | Ya cargadas: {existing}')
    return errors


def against_database(rows: list[SiteRow], *, apply: bool) -> int:
    # Mantener la vista previa del archivo independiente de la configuración y del motor.
    from geoalchemy2 import WKTElement
    from sqlalchemy import func, select, text
    from sqlalchemy.exc import SQLAlchemyError

    from app.db.session import SessionLocal
    from app.models import District, Institution, Site

    try:
        with SessionLocal.begin() as session:
            if apply:
                # Serializa las altas del catálogo y evita cambios entre la revisión y la inserción.
                session.execute(text('LOCK TABLE districts, institutions, sites IN SHARE ROW EXCLUSIVE MODE'))
            else:
                session.execute(text('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY'))

            districts = {item.ubigeo: item for item in session.scalars(select(District))}
            institutions = defaultdict(list)
            for item in session.scalars(select(Institution)):
                institutions[normalized(item.name)].append(item)

            saved_sites = session.execute(select(
                Site.id, Site.institution_id, Institution.name.label('institution_name'),
                Site.name, Site.is_demo, Site.district_ubigeo, Site.address, Site.description,
                Site.source, Site.public_source, Site.active, Site.verification_status,
                Site.verified_at, func.ST_Y(Site.location).label('latitude'),
                func.ST_X(Site.location).label('longitude'),
            ).join(Institution, Institution.id == Site.institution_id)).mappings().all()
            sites_by_id = {item['id']: item for item in saved_sites}
            sites_by_name = defaultdict(list)
            demo_institution_ids = set()
            for item in saved_sites:
                key = (normalized(item['institution_name']), normalized(item['name']))
                sites_by_name[key].append(item['id'])
                if item['is_demo']:
                    demo_institution_ids.add(item['institution_id'])

            for row in rows:
                if row.errors:
                    continue
                values = row.values
                district = districts.get(values['ubigeo'])
                if district and normalized(district.name) != normalized(values['distrito']):
                    row.errors.append('El UBIGEO está asociado a otro nombre de distrito en la base.')

                institution_key = normalized(values['institucion'])
                matches = institutions[institution_key]
                if len(matches) > 1:
                    row.errors.append('Hay varias instituciones con ese nombre en la base.')
                elif matches:
                    institution = matches[0]
                    if institution.id in demo_institution_ids:
                        row.errors.append('La institución coincide con una institución de demostración.')
                    if institution.category != values['categoria']:
                        row.errors.append('La categoría difiere de la registrada para esta institución.')

                key = (institution_key, normalized(values['sede']))
                if any(site_id != row.site_id for site_id in sites_by_name[key]):
                    row.errors.append('Ya existe una sede de nombre e institución equivalentes con otro identificador.')
                existing = sites_by_id.get(row.site_id)
                if existing is not None:
                    expected = site_fields(row) | {'latitude': row.latitude, 'longitude': row.longitude}
                    same_institution = normalized(existing['institution_name']) == institution_key
                    if same_institution and all(existing[field] == value for field, value in expected.items()):
                        row.already_loaded = True
                    else:
                        row.errors.append('El código de ficha ya tiene un registro con datos diferentes. Revisa el registro existente.')

            errors = report(rows)
            if not apply or errors:
                print('No se escribieron datos en PostgreSQL.')
                return 2 if errors else 0

            new_sites = []
            for row in rows:
                if row.already_loaded:
                    continue
                values = row.values
                ubigeo = values['ubigeo']
                if ubigeo and ubigeo not in districts:
                    districts[ubigeo] = District(ubigeo=ubigeo, name=values['distrito'])
                    session.add(districts[ubigeo])
                name = normalized(values['institucion'])
                if not institutions[name]:
                    institution = Institution(id=uuid4(), name=values['institucion'], category=values['categoria'])
                    institutions[name].append(institution)
                    session.add(institution)
                new_sites.append(Site(
                    id=row.site_id, institution_id=institutions[name][0].id,
                    location=WKTElement(f'POINT({row.longitude} {row.latitude})', srid=4326),
                    **site_fields(row),
                ))
            session.flush()  # Persistir los distritos e instituciones antes de sus sedes.
            session.add_all(new_sites)
        print(f'Carga confirmada: {len(new_sites)} sedes nuevas.')
        return 0
    except SQLAlchemyError:
        raise ValueError('No se completó la operación en PostgreSQL. Revisa la conexión, los permisos y las migraciones.') from None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archivo', type=Path, help='Ruta de la plantilla o del padrón CSV.')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--plantilla', action='store_true', help='Crea un CSV vacío en la ruta indicada.')
    mode.add_argument('--consultar-base', action='store_true', help='Amplía la vista previa con una consulta de solo lectura.')
    mode.add_argument('--aplicar', action='store_true', help='Inserta el lote en PostgreSQL si todas las fichas pasan la revisión.')
    args = parser.parse_args()

    try:
        if args.plantilla:
            create_template(args.archivo)
            print(f'Plantilla creada: {args.archivo}')
            return 0
        rows = read_rows(args.archivo)
        if args.consultar_base or (args.aplicar and not any(row.errors for row in rows)):
            return against_database(rows, apply=args.aplicar)
        errors = report(rows)
        print('Vista previa del archivo. No se consultó PostgreSQL.')
        return 2 if errors else 0
    except FileExistsError:
        parser.exit(1, 'La plantilla ya existe. Elige otra ruta para conservar el archivo existente.\n')
    except UnicodeError:
        parser.exit(1, 'El archivo debe guardarse con codificación UTF-8.\n')
    except csv.Error:
        parser.exit(1, 'El archivo tiene un formato CSV inválido. Revisa los separadores y las comillas.\n')
    except OSError as error:
        parser.exit(1, f'No se pudo acceder al archivo. {error.strerror}\n')
    except ValueError as error:
        parser.exit(1, f'{error}\n')


if __name__ == '__main__':
    raise SystemExit(main())
