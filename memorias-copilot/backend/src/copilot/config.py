import os

from pydantic import BaseModel, Field


def _load_dotenv() -> None:
    # config.py is at backend/src/copilot/config.py
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    env_file = os.path.join(base_dir, ".env")
    if os.path.exists(env_file):
        with open(env_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key and key not in os.environ:
                        os.environ[key] = val


_load_dotenv()


class Settings(BaseModel):
    model_config = {"frozen": True}

    openai_api_key: str = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    openai_model: str = Field(
        default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    )
    database_url: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL", "postgresql://postgres:postgres@localhost:51216/default"
        )
    )
    session_timeout_seconds: int = Field(default=3600)
    memorias_web_base_url: str = Field(
        default_factory=lambda: os.getenv(
            "MEMORIAS_WEB_BASE_URL",
            "http://localhost:3000",
        )
    )
