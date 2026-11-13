
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):

    nasa_firms_map_key: str = "c85c02cb0d1f92f10a8fb6c07306fe0b"




    gorongosa_west: float = 34.0
    gorongosa_south: float = -19.5
    gorongosa_east: float = 35.0
    gorongosa_north: float = -18.0


    # database_url: str = "mysql+pymysql://root:Boaventura@localhost:3306/fastapi_db"
    database_url: str = "mysql+pymysql://root:@localhost:3306/fastapi_db"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
