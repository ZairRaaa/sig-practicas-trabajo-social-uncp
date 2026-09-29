from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from app.api.router import router
from app.api.auth import router as auth_router
from fastapi.exceptions import RequestValidationError
from app.core.config import get_settings
from app.db.session import engine

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    engine.dispose()


app = FastAPI(title=settings.app_name, version='0.1.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins,
                   allow_credentials=True, allow_methods=['GET', 'POST'],
                   allow_headers=['Accept', 'Content-Type', 'X-CSRF-Token'])
app.include_router(router)
app.include_router(auth_router)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    # No reflejar contraseñas ni cuerpos de formularios en respuestas de error.
    return JSONResponse(status_code=422, content={'detail': 'Revisa los datos enviados.'})


@app.exception_handler(SQLAlchemyError)
async def database_error(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    # No enviar SQL, parámetros, credenciales ni mensajes del controlador al cliente.
    return JSONResponse(status_code=503, content={
        'detail': 'No se pudo consultar la base de datos. Revisa la configuración y las migraciones.'
    })
