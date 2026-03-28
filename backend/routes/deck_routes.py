"""
Deck routes blueprint.

Defines all API endpoints related to finding a 
deck, based on top 1000 players and player levels
"""

from flask import Blueprint, jsonify, request
from services.clash_royale_service import ClashRoyaleService
from flask import current_app
import time
from threading import Lock

DECK_CACHE_DATA = []
DECK_CACHE_TIMESTAMP = 0.0
CACHE_LOCK = Lock()
CACHE_TTL = 600  # 10 minutes

deck_bp = Blueprint('decks', __name__, url_prefix='/api/decks')

def get_clash_royale_service() -> ClashRoyaleService:
    return ClashRoyaleService(
        api_key=current_app.config['CLASH_ROYALE_API_KEY'],
        base_url=current_app.config['CLASH_ROYALE_API_BASE_URL'],
        timeout=current_app.config.get('API_REQUEST_TIMEOUT', 30)
    )

from concurrent.futures import ThreadPoolExecutor

def is_card_in_deck(req_card, deck):
    target_evo = None
    if req_card.startswith('1') or req_card.startswith('2'):
        target_evo = int(req_card[0])
        target_name = req_card[1:]
    else:
        target_name = req_card
    
    for c in deck:
        if c.get('name') == target_name:
            if target_evo is None or c.get('evolutionLevel') == target_evo:
                return True
    return False

def fetch_player_deck(player_data, position, service):
    try:
        player_tag = player_data.get('tag')
        if not player_tag:
            return None

        # Fetch battle log to find the current ranked deck
        battle_log = service.get_player_battle_log(player_tag)
        
        if not battle_log or not isinstance(battle_log, list) or len(battle_log) == 0:
            return None
        
        most_recent_ranked_battle = None
        for battle in battle_log:
            if battle.get('type') == 'pathOfLegend':
                most_recent_ranked_battle = battle
                break
        
        if not most_recent_ranked_battle:
            return None
        
        team = most_recent_ranked_battle.get('team', [])
        if not team or len(team) == 0:
            return None
        
        player_team_data = team[0]
        current_ranked_deck = player_team_data.get('cards', [])
        
        player_info = service.get_player_info(player_tag) # we fetch info to get the player's name
        player_name = player_info.get('name') if isinstance(player_info, dict) else 'Unknown'

        return {
            'player_name': player_name,
            'player_tag': player_tag,
            'position': position,
            'deck': current_ranked_deck
        }
    except Exception as e:
        pass
    return None

@deck_bp.route('/', methods=['GET'])
def get_decks():
    try:
        cards_param = request.args.get('cards')
        if not cards_param:
            return jsonify({
                'success': False,
                'error': 'Please provide the cards parameter (e.g., ?cards=c1,c2)'
            }), 400
        
        cards_list = [c.strip() for c in cards_param.split(',')]
        if len(cards_list) < 1 or len(cards_list) > 8:
            return jsonify({
                'success': False,
                'error': 'You must provide between 1 and 8 cards for filtering'
            }), 400
        

        service = get_clash_royale_service()
        
        with CACHE_LOCK:
            global DECK_CACHE_DATA, DECK_CACHE_TIMESTAMP
            current_time = time.time()
            if current_time - DECK_CACHE_TIMESTAMP > CACHE_TTL or not DECK_CACHE_DATA:
                # Fetch leaderboard
                leaderboard_data = service.get_pol_leaderboard('current')
                players = leaderboard_data.get('items', [])
                
                # We can now handle 1000 since it is concurrent
                LIMIT = 1000
                players_to_check = players[:LIMIT]
                
                fetched_decks = []
                with ThreadPoolExecutor(max_workers=10) as executor:
                    futures = []
                    for position, player in enumerate(players_to_check, 1):
                        futures.append(executor.submit(fetch_player_deck, player, position, service))
                        
                    for future in futures:
                        result = future.result()
                        if result:
                            fetched_decks.append(result)
                
                DECK_CACHE_DATA = fetched_decks
                DECK_CACHE_TIMESTAMP = current_time

        matching_decks = []
        for cached_deck in DECK_CACHE_DATA:
            print(cached_deck['position'])
            if all(is_card_in_deck(req_card, cached_deck['deck']) for req_card in cards_list):
                matching_decks.append(cached_deck)
                
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
