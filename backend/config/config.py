import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from backend/.env
base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(base_dir, '.env'))

class Config:
    """Base Configuration Class"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-session-secret-key-987234')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-jwt-secret-key-987234')
    
    # Token expiration configurations
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Database Configuration
    raw_db_url = os.environ.get('DATABASE_URL')
    if not raw_db_url:
        if os.environ.get('VERCEL') == '1':
            raw_db_url = 'sqlite:////tmp/app.db'
        else:
            raw_db_url = 'sqlite:///app.db'
    # Fix older 'postgres://' schema prefix if present and map to pure-Python pg8000 driver
    if raw_db_url:
        if raw_db_url.startswith('postgres://'):
            raw_db_url = raw_db_url.replace('postgres://', 'postgresql+pg8000://', 1)
        elif raw_db_url.startswith('postgresql://'):
            raw_db_url = raw_db_url.replace('postgresql://', 'postgresql+pg8000://', 1)
        
    SQLALCHEMY_DATABASE_URI = raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security parameters
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }
