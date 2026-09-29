from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / '.env', env_file_encoding='utf-8', extra='ignore'
    )

    app_name: str = 'Territorio API'
    db_host: str = 'localhost'
    db_port: int = Field(default=5432, ge=1, le=65535)
    db_name: str = 'territorio'
    db_user: str = 'territorio_app'
    db_password: SecretStr = SecretStr('')
    cors_origins: list[str] = ['http://localhost:5173', 'http://127.0.0.1:5173']
    session_cookie_secure: bool = False  # True al publicar con HTTPS.
    session_hours: int = Field(default=8, ge=1, le=24)

    @property
    def database_url(self) -> URL:
        # URL.create admite contraseñas con caracteres especiales sin concatenarlas.
        return URL.create(
            'postgresql+psycopg', username=self.db_user,
            password=self.db_password.get_secret_value(), host=self.db_host,
            port=self.db_port, database=self.db_name,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
