"""
Leaderboard Routes .
"""

from flask import Blueprint, jsonify, request
from services.clash_royale_service import ClashRoyaleService
from flask import current_app

leaderboard_bp = Blueprint('leaderboards', __name__, url_prefix='/api/leaderboards')

def get_clash_royale_service() -> ClashRoyaleService:
    """
    Helper function to get an initialized ClashRoyaleService instance.
    
    Returns:
        ClashRoyaleService: Initialized service instance
    """
    return ClashRoyaleService(
        api_key=current_app.config['CLASH_ROYALE_API_KEY'],
        base_url=current_app.config['CLASH_ROYALE_API_BASE_URL'],
        timeout=current_app.config.get('API_REQUEST_TIMEOUT', 30)
    )

@leaderboard_bp.route('/pathoflegends/<season>', methods=['GET'])
def get_pol_leaderboard(season: str):
    try:
        service = get_clash_royale_service()
        pol_leaderboard = service.get_pol_leaderboard(season)
        
        """season are IDed by year-month example 2025-12"""
        
        return jsonify({
            'success': True,
            'data': pol_leaderboard
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching cards: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching cards'
        }), 500