"""
Winrate routes blueprint.

Exposes the tracked winrates from the SQLite database.
"""

from flask import Blueprint, jsonify, current_app
from services.winrate_service import get_current_winrates

winrate_bp = Blueprint('winrates', __name__, url_prefix='/api/winrates')

@winrate_bp.route('/', methods=['GET'])
def get_winrates():
    """
    Get winrates for all cards.

    Returns:
        JSON response with the winrates for each card.
        Example: { "Wizard": { "wins": 10, "losses": 5 }, ... }
    """
    try:
        data = get_current_winrates()
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data)
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching winrates: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching winrates'
        }), 500
