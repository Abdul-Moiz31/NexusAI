from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "NexusAI"
    OPENAI_API_KEY: str
    TAVILY_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./data/nexus.db"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
