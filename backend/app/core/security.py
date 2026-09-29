import hashlib
import secrets
from collections import deque
from threading import Lock
from time import monotonic
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import HTTPException, Request
from app.core.config import get_settings

COOKIE_NAME = 'territorio_session'
COOKIE_PATH = '/api/v1'
password_hasher = PasswordHasher()
dummy_hash = password_hasher.hash(secrets.token_urlsafe(32))
attempts: dict[str, deque[float]] = {}
attempt_lock = Lock()


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def csrf_token(token: str) -> str:
    return hashlib.sha256(('csrf:' + token).encode()).hexdigest()


def verify_password(encoded: str, password: str) -> bool:
    try:
        return password_hasher.verify(encoded, password)
    except (VerificationError, InvalidHashError):
        return False


def require_origin(request: Request):
    if request.headers.get('origin') not in get_settings().cors_origins:
        raise HTTPException(403, 'Origen de solicitud no permitido.')


def require_csrf(request: Request):
    require_origin(request)
    token = request.cookies.get(COOKIE_NAME, '')
    supplied = request.headers.get('x-csrf-token', '')
    if not token or not secrets.compare_digest(csrf_token(token), supplied):
        raise HTTPException(403, 'La sesión debe actualizarse antes de continuar.')


def limit_login(request: Request):
    # Límite local por IP real del socket; no confiar en X-Forwarded-For arbitrario.
    ip = request.client.host if request.client else 'unknown'
    now = monotonic()
    with attempt_lock:
        for key in list(attempts):
            while attempts[key] and attempts[key][0] <= now - 60:
                attempts[key].popleft()
            if not attempts[key]:
                del attempts[key]
        if ip not in attempts and len(attempts) >= 1024:
            raise HTTPException(429, 'Demasiados intentos. Espera un minuto.', headers={'Retry-After': '60'})
        bucket = attempts.setdefault(ip, deque())
        if len(bucket) >= 10:
            raise HTTPException(429, 'Demasiados intentos. Espera un minuto.', headers={'Retry-After': '60'})
        bucket.append(now)
