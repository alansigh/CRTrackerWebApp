"""
Configuration module for Clash Royale Tracking App backend.

This module handles all configuration settings including API endpoints,
CORS settings, and environment variables.
"""

import os
from pathlib import Path

# Base directory of the backend application
BASE_DIR = Path(__file__).parent

# Clash Royale API Configuration
# Base URL for all Clash Royale API requests
CLASH_ROYALE_API_BASE_URL = "https://api.clashroyale.com/v1/"

# Path to the API key file
API_KEY_FILE = BASE_DIR / "api_key.txt"


def get_api_key():
    """
    Reads the Clash Royale API key from the api_key.txt file.
    
    Returns:
        str: The API key string
        
    Raises:
        FileNotFoundError: If the api_key.txt file doesn't exist
        ValueError: If the API key file is empty or contains only whitespace
    """
    try:
        with open(API_KEY_FILE, 'r') as f:
            api_key = f.read().strip()
            
        if not api_key or api_key == "YOUR_CLASH_ROYALE_API_KEY_HERE":
            raise ValueError(
                "Please replace 'YOUR_CLASH_ROYALE_API_KEY_HERE' in api_key.txt "
                "with your actual Clash Royale API key. "
                "Get your key from: https://developer.clashroyale.com/"
            )
            
        return api_key
    except FileNotFoundError:
        raise FileNotFoundError(
            f"API key file not found at {API_KEY_FILE}. "
            "Please create api_key.txt and add your Clash Royale API key."
        )


class Config:
    """
    Base configuration class for Flask application.
    
    This class contains default settings for the Flask app including
    CORS configuration, API settings, and debug mode.
    """
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # API Configuration
    CLASH_ROYALE_API_BASE_URL = CLASH_ROYALE_API_BASE_URL
    CLASH_ROYALE_API_KEY = get_api_key()
    
    # CORS Configuration for React Frontend
    # This allows the React frontend (typically on localhost:5173 for Vite)
    # to make requests to this Flask backend
    CORS_ORIGINS = [
        "http://localhost:5173",  # Vite default dev server
        "http://localhost:3000",  # Alternative React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Request timeout for Clash Royale API calls (in seconds)
    API_REQUEST_TIMEOUT = 30
    
    # Maximum number of retries for failed API requests
    API_MAX_RETRIES = 3


class DevelopmentConfig(Config):
    """
    Development configuration.
    
    Extends the base Config class with development-specific settings.
    """
    DEBUG = True


class ProductionConfig(Config):
    """
    Production configuration.
    
    Extends the base Config class with production-specific settings.
    Use environment variables for sensitive data in production.
    """
    DEBUG = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or Config.SECRET_KEY


# Configuration dictionary for easy access
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


