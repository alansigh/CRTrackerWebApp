"""
Card Routes Blueprint.

This module defines API endpoints related to Clash Royale cards,
including card information and card lists.
"""

from flask import Blueprint, jsonify
from services.clash_royale_service import ClashRoyaleService
from flask import current_app

# Create a blueprint for card-related routes
card_bp = Blueprint('cards', __name__, url_prefix='/api/cards')


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


@card_bp.route('/', methods=['GET'])
def get_all_cards():
    """
    Get list of all cards in Clash Royale.
    
    Returns:
        JSON response with list of all cards including:
        - id: Card ID
        - name: Card name
        - maxLevel: Maximum level
        - iconUrls: Card image URLs
        - rarity: Card rarity (Common, Rare, Epic, Legendary)
        - elixirCost: Elixir cost
    
    Example request:
        GET /api/cards/
    
    Note: This endpoint returns all cards. You may want to cache this
    as card data doesn't change frequently.
    """
    try:
        service = get_clash_royale_service()
        cards_data = service.get_cards()
        
        # TODO: Add custom processing here
        # Example: Filter by rarity, sort by elixir cost, group by type
        # cards = cards_data.get('items', [])
        # 
        # # Group by rarity
        # cards_by_rarity = {}
        # for card in cards:
        #     rarity = card.get('rarity', 'Unknown')
        #     if rarity not in cards_by_rarity:
        #         cards_by_rarity[rarity] = []
        #     cards_by_rarity[rarity].append(card)
        # 
        # cards_data['byRarity'] = cards_by_rarity
        
        return jsonify({
            'success': True,
            'data': cards_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching cards: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching cards'
        }), 500


@card_bp.route('/rarity/<rarity>', methods=['GET'])
def get_cards_by_rarity(rarity: str):
    """
    Get cards filtered by rarity.
    
    URL Parameters:
        rarity (str): Card rarity (Common, Rare, Epic, Legendary, Champion)
    
    Returns:
        JSON response with filtered list of cards
    
    Example request:
        GET /api/cards/rarity/Legendary
    
    TODO: Implement this endpoint to filter cards by rarity
    This is an example of how you can add custom endpoints that process
    the base card data in different ways.
    """
    try:
        service = get_clash_royale_service()
        cards_data = service.get_cards()
        
        # Filter cards by rarity
        all_cards = cards_data.get('items', [])
        filtered_cards = [
            card for card in all_cards
            if card.get('rarity', '').lower() == rarity.lower()
        ]
        
        return jsonify({
            'success': True,
            'data': {
                'items': filtered_cards,
                'count': len(filtered_cards)
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching cards by rarity {rarity}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching cards'
        }), 500
    
@card_bp.route('/<name>', methods=['GET'])
def get_card_info(name: str):
    try:
        service = get_clash_royale_service()
        cards_data = service.get_cards()

        all_cards = cards_data.get('items', [])
        for card in all_cards:
            if card.get('name', '').lower() == name.lower():
                searched_card = card

        return jsonify({
            'success': True,
            'data': {
                searched_card
            }
        })
        

    except Exception as e:
        current_app.logger.error(f"Error fetching card info by name {name}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching card info'
        }), 500


