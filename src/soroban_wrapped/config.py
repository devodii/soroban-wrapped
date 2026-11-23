from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT / ".env", extra="ignore")

    database_url: str = "postgresql://soroban:soroban@localhost:5442/soroban"
    networks_file: Path = ROOT / "workflow" / "networks.yaml"
    pgschema_image: str = "pgplex/pgschema:1.14.1"


@lru_cache
def get_settings() -> Settings:
    return Settings()
