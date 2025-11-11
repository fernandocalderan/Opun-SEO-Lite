from functools import lru_cache
from typing import List
import json

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Opun Backend"
    environment: str = "development"
    log_level: str = "info"

    port: int = 8000

    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    database_url: str | None = None
    redis_url: str | None = "redis://redis:6379/0"

    openai_api_key: str | None = None
    serpapi_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"
        env_prefix = ""
        case_sensitive = False

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _parse_allowed_origins(cls, v):
        # Admite JSON ("[\"http://...\"]") o coma separada ("http://...,http://...") o valor único
        if isinstance(v, str):
            s = v.strip()
            if not s:
                return []
            if s.startswith("["):
                try:
                    return json.loads(s)
                except Exception:
                    pass
            return [x.strip() for x in s.split(",") if x.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]
