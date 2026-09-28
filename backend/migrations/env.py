from alembic import context
from app.db.base import Base
from app.db.session import engine
from app.models import District, Institution, Site  # noqa: F401


def include_object(obj, name, type_, reflected, compare_to):
    # Nunca proponer borrar tablas de PostGIS u otras tablas ajenas al proyecto.
    return not (type_ == 'table' and name not in Base.metadata.tables)


def run_migrations():
    if context.is_offline_mode():
        raise RuntimeError('Usa migraciones conectadas a la base local: alembic upgrade head.')
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata,
                          include_object=include_object, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()


run_migrations()
