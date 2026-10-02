"""Dependencias compartidas de base de datos, sesión y autorización."""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import COOKIE_NAME, token_hash
from app.db.session import get_session
from app.models import User, UserSession

Database = Annotated[Session, Depends(get_session)]


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


Staff = Annotated[User, Depends(require_roles('admin', 'coordinator'))]
Student = Annotated[User, Depends(require_roles('student'))]
