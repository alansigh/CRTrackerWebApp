"""
Routes package for Flask API endpoints.

This package contains blueprint modules for organizing API routes
into logical groups (players, clans, cards, etc.).
"""

from .player_routes import player_bp
from .clan_routes import clan_bp
from .card_routes import card_bp
from .tournament_routes import tournament_bp

__all__ = ['player_bp', 'clan_bp', 'card_bp', 'tournament_bp']


