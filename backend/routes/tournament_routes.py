"""
Tournament Routes Blueprint.

This module defines API endpoints related to Clash Royale tournaments,
including tournament search and information.
"""

from flask import Blueprint, jsonify, request
from services.clash_royale_service import ClashRoyaleService
from flask import current_app

# Create a blueprint for tournament-related routes
tournament_bp = Blueprint('tournaments', __name__, url_prefix='/api/tournaments')


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


@tournament_bp.route('/search', methods=['GET'])
def search_tournaments():
    """
    Search for tournaments by name.
    
    Query Parameters:
        name (str, required): Tournament name to search for
    
    Returns:
        JSON response with list of tournaments matching the search name
    
    Example request:
        GET /api/tournaments/search?name=Grand Challenge
    
    Note: Tournament search requires a minimum name length and returns
    tournaments that match the search criteria.
    """
    try:
        name = request.args.get('name')
        
        if not name:
            return jsonify({
                'success': False,
                'error': 'Tournament name is required. Use ?name=<tournament_name>'
            }), 400
        
        service = get_clash_royale_service()
        tournaments_data = service.get_tournaments(name)
        
        # TODO: Add custom processing here
        # Example: Filter by status, sort by player count, format data
        # tournaments = tournaments_data.get('items', [])
        # active_tournaments = [t for t in tournaments if t.get('status') == 'active']
        
        return jsonify({
            'success': True,
            'data': tournaments_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error searching tournaments: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while searching tournaments'
        }), 500


