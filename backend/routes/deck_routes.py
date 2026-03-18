"""
Deck routes blueprint.

Defines all API endpoints related to finding a 
deck, based on top 1000 players and player levels
"""

from flask import Blueprint, jsonify, request
from services.clash_royale_service import ClashRoyaleService
from flask import current_app

deck_bp = Blueprint('decks', __name__, url_prefix='/api/decks')

def get_clash_royale_service() -> ClashRoyaleService:
    return ClashRoyaleService(
        api_key=current_app.config['CLASH_ROYALE_API_KEY'],
        base_url=current_app.config['CLASH_ROYALE_API_BASE_URL'],
        timeout=current_app.config.get('API_REQUEST_TIMEOUT', 30)
    )

@deck_bp.route('/', methods=['GET'])
def get_decks():
    try:
        cards_param = request.args.get('cards')
        if not cards_param:
            return jsonify({
                'success': False,
                'error': 'Please provide the cards parameter (e.g., ?cards=c1,c2)'
            }), 400
        
        cards_list = [c.strip().lower() for c in cards_param.split(',')]
        if len(cards_list) < 1 or len(cards_list) > 8:
            return jsonify({
                'success': False,
                'error': 'You must provide between 1 and 8 cards for filtering'
            }), 400
        
        service = get_clash_royale_service()
        # Fetch leaderboard
        leaderboard_data = service.get_pol_leaderboard('current')
        players = leaderboard_data.get('items', [])
        
        # Limit to top 50 to avoid timeout issues
        LIMIT = 1000
        players_to_check = players[:LIMIT]
        
        matching_decks = []
        
        for player in players_to_check:
            try:
                player_tag = player.get('tag')
                if not player_tag:
                    continue
                
                # Fetch battle log to find the current ranked deck
                battle_log = service.get_player_battle_log(player_tag)
                
                if not battle_log or not isinstance(battle_log, list) or len(battle_log) == 0:
                    continue
                
                most_recent_ranked_battle = None
                for battle in battle_log:
                    if battle.get('type') == 'pathOfLegend':
                        most_recent_ranked_battle = battle
                        break
                
                if not most_recent_ranked_battle:
                    continue
                
                team = most_recent_ranked_battle.get('team', [])
                if not team or len(team) == 0:
                    continue
                
                player_data = team[0]
                current_ranked_deck = player_data.get('cards', [])
                
                # Check if all specified cards are in the deck
                deck_card_names = [card.get('name', '').lower() for card in current_ranked_deck]
                
                if all(card_name in deck_card_names for card_name in cards_list):
                    player_info = service.get_player_info(player_tag) # we fetch info to get the player's name
                    player_name = player_info.get('name') if player_info else 'Unknown'
                    matching_decks.append({
                        'player_name': player_name,
                        'player_tag': player_tag,
                        'deck': current_ranked_deck
                    })
            except Exception as e:
                current_app.logger.warning(f"Error fetching player {player.get('tag')}: {str(e)}")
                continue
                
        return jsonify({
            'success': True,
            'data': matching_decks,
            'count': len(matching_decks)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching decks: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching decks'
        }), 500
