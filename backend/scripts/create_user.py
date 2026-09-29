"""Crea una cuenta local sin recibir contraseñas por argumentos o archivos."""
import argparse
import getpass
import re
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from app.core.security import password_hasher
from app.db.session import SessionLocal
from app.models import User


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--username', required=True)
    parser.add_argument('--role', choices=['student', 'coordinator', 'admin'], default='student')
    args = parser.parse_args()
    username = args.username.strip().lower()
    if not re.fullmatch(r'[a-z0-9._-]{3,80}', username):
        parser.error('El usuario debe tener 3–80 caracteres: letras, números, punto, guion o guion bajo.')
    name = input('Nombre para mostrar: ').strip()
    if not 1 <= len(name) <= 120:
        parser.error('El nombre debe tener entre 1 y 120 caracteres.')
    password = getpass.getpass('Contraseña (12–128 caracteres): ')
    if not 12 <= len(password) <= 128:
        parser.error('La contraseña debe tener entre 12 y 128 caracteres.')
    if password != getpass.getpass('Repetir contraseña: '):
        parser.error('Las contraseñas no coinciden.')
    try:
        with SessionLocal.begin() as session:
            if session.scalar(select(User.id).where(User.username == username)) is not None:
                parser.error('Ese usuario ya existe; no se modificó su cuenta.')
            session.add(User(username=username, display_name=name,
                             password_hash=password_hasher.hash(password), role=args.role, active=True))
        print(f'Cuenta {username} creada con rol {args.role}.')
    except SQLAlchemyError:
        parser.exit(1, 'No se creó la cuenta. Revisa conexión, migraciones o posible usuario duplicado.\n')


if __name__ == '__main__':
    main()
