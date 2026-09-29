from datetime import datetime, timedelta, timezone
import secrets
from typing import Annotated, Literal
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, SecretStr
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.security import (COOKIE_NAME, COOKIE_PATH, csrf_token, dummy_hash,
    limit_login, password_hasher, require_csrf, require_origin, token_hash, verify_password)
from app.db.session import get_session
from app.models import User, UserSession

router = APIRouter(prefix='/api/v1/auth', tags=['Acceso'])
Database = Annotated[Session, Depends(get_session)]


class LoginInput(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    password: SecretStr = Field(min_length=1, max_length=128)


class UserRead(BaseModel):
    id: UUID
    username: str
    display_name: str
    role: Literal['student', 'coordinator', 'admin']


class SessionRead(BaseModel):
    user: UserRead
    csrf_token: str


def session_response(user: User, token: str) -> SessionRead:
    return SessionRead(user=UserRead(id=user.id, username=user.username,
        display_name=user.display_name, role=user.role), csrf_token=csrf_token(token))


def current_user(request: Request, session: Database) -> User:
    token = request.cookies.get(COOKIE_NAME)
    if not token or len(token) > 128:
        raise HTTPException(401, 'Inicia sesión para continuar.')
    user = session.scalar(select(User).join(UserSession).where(
        UserSession.token_hash == token_hash(token),
        UserSession.expires_at > datetime.now(timezone.utc), User.active.is_(True)))
    if user is None:
        raise HTTPException(401, 'La sesión terminó. Inicia sesión nuevamente.')
    return user


def require_roles(*roles: str):
    def authorized(user: Annotated[User, Depends(current_user)]) -> User:
        if user.role not in roles:
            raise HTTPException(403, 'Tu cuenta no tiene permiso para esta acción.')
        return user
    return authorized


@router.post('/login', response_model=SessionRead, dependencies=[Depends(require_origin), Depends(limit_login)])
def login(data: LoginInput, request: Request, response: Response, session: Database):
    user = session.scalar(select(User).where(User.username == data.username.strip().lower()))
    valid = verify_password(user.password_hash if user else dummy_hash, data.password.get_secret_value())
    if not valid or user is None or not user.active:
        raise HTTPException(401, 'Usuario o contraseña incorrectos.')
    if password_hasher.check_needs_rehash(user.password_hash):
        user.password_hash = password_hasher.hash(data.password.get_secret_value())
    old_token = request.cookies.get(COOKIE_NAME)
    if old_token:
        session.execute(delete(UserSession).where(UserSession.token_hash == token_hash(old_token)))
    now = datetime.now(timezone.utc)
    session.execute(delete(UserSession).where(UserSession.expires_at <= now))
    token = secrets.token_urlsafe(32)
    duration = get_settings().session_hours * 3600
    session.add(UserSession(token_hash=token_hash(token), user_id=user.id,
                            expires_at=now + timedelta(seconds=duration)))
    session.commit()
    response.set_cookie(COOKIE_NAME, token, max_age=duration, httponly=True,
                        secure=get_settings().session_cookie_secure, samesite='lax', path=COOKIE_PATH)
    response.headers['Cache-Control'] = 'no-store'
    return session_response(user, token)


@router.get('/me', response_model=SessionRead)
def me(request: Request, response: Response, user: Annotated[User, Depends(current_user)]):
    response.headers['Cache-Control'] = 'no-store'
    return session_response(user, request.cookies[COOKIE_NAME])


@router.post('/logout', dependencies=[Depends(require_csrf)])
def logout(request: Request, response: Response, session: Database):
    session.execute(delete(UserSession).where(
        UserSession.token_hash == token_hash(request.cookies.get(COOKIE_NAME, ''))))
    session.commit()
    response.delete_cookie(COOKIE_NAME, path=COOKIE_PATH, httponly=True,
                           secure=get_settings().session_cookie_secure, samesite='lax')
    response.headers['Cache-Control'] = 'no-store'
    return {'message': 'Sesión cerrada.'}


@router.get('/staff-access')
def staff_access(response: Response, user: Annotated[User, Depends(require_roles('admin', 'coordinator'))]):
    response.headers['Cache-Control'] = 'no-store'
    return {'role': user.role, 'message': 'Acceso de gestión autorizado. Los módulos de gestión se implementarán en su fase.'}
