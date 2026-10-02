"""Establece una referencia revisada para su publicación en una ficha de sede."""
import argparse
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError

from app.db.session import SessionLocal
from app.models import Site


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', required=True, type=UUID)
    parser.add_argument('--clear', action='store_true', help='Retira la referencia pública.')
    args = parser.parse_args()
    source = None
    if not args.clear:
        source = input('Referencia autorizada para mostrarse públicamente (1–1000 caracteres): ').strip()
        if not 1 <= len(source) <= 1000:
            parser.error('La referencia pública debe tener entre 1 y 1000 caracteres.')
    try:
        with SessionLocal.begin() as session:
            site = session.get(Site, args.site)
            if site is None:
                parser.error('La sede no existe.')
            site.public_source = source
        print('Referencia pública actualizada. No se modificaron la evidencia interna ni el estado de verificación.')
    except SQLAlchemyError:
        parser.exit(1, 'No se actualizó la referencia. Revisa conexión y migraciones.\n')


if __name__ == '__main__':
    main()
