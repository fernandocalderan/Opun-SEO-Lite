"""Application settings and configuration helpers."""

from functools import lru_cache
from typing import Literal, Optional, List, Union

from pydantic import AnyHttpUrl, Field, PostgresDsn, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised application configuration."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Opun Intelligence Suite API"
    environment: Literal["local", "development", "staging", "production"] = "local"
    debug: bool = False
    api_v1_prefix: str = "/v1"
    docs_url: Optional[str] = "/docs"
    redoc_url: Optional[str] = "/redoc"

    database_url: PostgresDsn = Field(
        default="postgresql+asyncpg://postgres:postgres@db:5432/opun_api",
        description="SQLAlchemy compatible async PostgreSQL DSN.",
    )
    db_echo: bool = False
    db_pool_size: int = 10
    db_max_overflow: int = 20

    cors_allow_origins: Union[List[AnyHttpUrl], str] = Field(default_factory=list)
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = Field(default_factory=lambda: ["*"])
    cors_allow_headers: List[str] = Field(default_factory=lambda: ["*"])

    jwt_public_key: Optional[str] = None
    jwt_algorithm: str = "RS256"
    rate_limit_per_minute: int = 120

    service_name: str = "api-gateway"

    # ✅ compatible con Pydantic 1.x
    @validator("cors_allow_origins", pre=True)
    def _split_origins(cls, value: Union[List[AnyHttpUrl], str]):
        if isinstance(value, str) and value:
            return [origin.strip() for origin in value.split(",")]
        return value


@lru_cache()
def get_settings() -> Settings:
    """Return a cached copy of the application settings."""
    return Settings()
