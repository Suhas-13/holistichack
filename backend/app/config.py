"""
Configuration management using Pydantic Settings.
"""
import os
from pydantic_settings import BaseSettings
from typing import List, Optional

# Load .env from backend directory
from dotenv import load_dotenv
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # API Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # AWS Configuration (optional - for Bedrock)
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None

    # API Keys (required for mutation system)
    TOGETHER_API_KEY: str  # For Llama Guard evaluation
    OPENROUTER_API_KEY: Optional[str] = None  # For Qwen attacker

    # Attack Configuration
    DEFAULT_SEED_ATTACK_COUNT: int = 20
    MAX_ATTACK_TURNS: int = 3
    MIN_ATTACK_TURNS: int = 1
    ATTACK_TIMEOUT_SECONDS: int = 35

    # CORS Settings
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS into a list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Global settings instance
settings = Settings()
