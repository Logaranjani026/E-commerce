import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend directory
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "smartcart-ai-super-secret-jwt-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "smartcart-jwt-auth-token-key-2026")
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "72"))
    
    # Database Configuration: Defaults to SQLite for zero-config run, or MySQL if specified
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "smartcart_db")
    USE_MYSQL = os.getenv("USE_MYSQL", "false").lower() in ("true", "1", "yes")

    DATABASE_URL = os.getenv("DATABASE_URL")

    if DATABASE_URL:
        # Handle postgres:// to postgresql:// if needed (e.g. Heroku/Neon)
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    elif USE_MYSQL:
        SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    elif os.getenv("VERCEL"):
        # On Vercel serverless, root fs is read-only, use /tmp
        tmp_db = Path("/tmp/smartcart.db")
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{tmp_db.as_posix()}"
    else:
        # Portable SQLite database file
        sqlite_path = BASE_DIR / "smartcart.db"
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{sqlite_path.as_posix()}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    } if USE_MYSQL else {}

    # AI API Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

    # Application settings
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
