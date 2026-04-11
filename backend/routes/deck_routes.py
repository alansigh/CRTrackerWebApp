"""
Deck routes blueprint.

Defines all API endpoints related to finding a 
deck, based on top 1000 players and player levels.

Includes a background scheduler that pre-fetches and caches
the top 1000 leaderboard decks every 10 minutes so the data
is always warm for incoming requests.
"""

from flask import Blueprint, jsonify, request, current_app
from services.clash_royale_service import ClashRoyaleService
from concurrent.futures import ThreadPoolExecutor
import threading
import time
import logging

logger = logging.getLogger(__name__)

deck_bp = Blueprint('decks', __name__, url_prefix='/api/decks')

# ── Module-level cache ────────────────────────────────────────────────
_deck_cache: dict = {
    'data': None,       # list[dict] – the cached deck payloads
    'updated_at': None,  # float – timestamp of last successful refresh
}
_cache_lock = threading.Lock()
_scheduler_started = False

REFRESH_INTERVAL_SECONDS = 600  # 10 minutes


# ── Helpers ───────────────────────────────────────────────────────────

def _build_service(app):
    """Build a ClashRoyaleService using the given app's config."""
    return ClashRoyaleService(
        api_key=app.config['CLASH_ROYALE_API_KEY'],
        base_url=app.config['CLASH_ROYALE_API_BASE_URL'],
        timeout=app.config.get('API_REQUEST_TIMEOUT', 30),
    )


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

        player_info = service.get_player_info(player_tag)
        player_name = player_info.get('name') if isinstance(player_info, dict) else 'Unknown'

        return {
            'player_name': player_name,
            'player_tag': player_tag,
            'position': position,
            'deck': current_ranked_deck,
        }
    except Exception:
        pass
    return None


# ── Core fetch logic (runs inside an app context) ─────────────────────

def _fetch_leaderboard_decks(app):
    """Fetch top-1000 leaderboard decks and store them in the module cache."""
    with app.app_context():
        try:
            service = _build_service(app)
            leaderboard_data = service.get_pol_leaderboard('current')
            players = leaderboard_data.get('items', [])

            LIMIT = 1000
            players_to_check = players[:LIMIT]

            fetched_decks = []
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = [
                    executor.submit(fetch_player_deck, player, pos, service)
                    for pos, player in enumerate(players_to_check, 1)
                ]
                for future in futures:
                    result = future.result()
                    if result:
                        fetched_decks.append(result)

            with _cache_lock:
                _deck_cache['data'] = fetched_decks
                _deck_cache['updated_at'] = time.time()

            logger.info(
                "Leaderboard deck cache refreshed — %d decks cached.",
                len(fetched_decks),
            )
        except Exception as e:
            logger.error("Failed to refresh leaderboard deck cache: %s", e)


# ── Background scheduler ─────────────────────────────────────────────

def _scheduler_loop(app):
    """Daemon thread that refreshes the cache every REFRESH_INTERVAL_SECONDS."""
    while True:
        _fetch_leaderboard_decks(app)
        time.sleep(REFRESH_INTERVAL_SECONDS)


def init_deck_cache(app):
    """
    Start the background cache scheduler.

    Call this once after the app is fully created (in app.py).
    It spawns a daemon thread that immediately fetches the leaderboard
    data and then re-fetches every 10 minutes.
    """
    global _scheduler_started
    if _scheduler_started:
        return
    _scheduler_started = True

    thread = threading.Thread(
        target=_scheduler_loop,
        args=(app,),
        daemon=True,
        name='deck-cache-scheduler',
    )
    thread.start()
    logger.info("Deck cache background scheduler started (interval=%ds).", REFRESH_INTERVAL_SECONDS)


# ── Route ─────────────────────────────────────────────────────────────

@deck_bp.route('/', methods=['GET'])
def get_decks():
    try:
        cards_param = request.args.get('cards')
        if not cards_param:
            return jsonify({
                'success': False,
                'error': 'Please provide the cards parameter (e.g., ?cards=c1,c2)',
            }), 400

        cards_list = [c.strip() for c in cards_param.split(',')]
        if len(cards_list) < 1 or len(cards_list) > 8:
            return jsonify({
                'success': False,
                'error': 'You must provide between 1 and 8 cards for filtering',
            }), 400

        # Read from the always-warm cache
        with _cache_lock:
            cached_decks = _deck_cache['data']

        if cached_decks is None:
            return jsonify({
                'success': False,
                'error': 'Leaderboard data is still loading. Please try again in a moment.',
            }), 503

        matching_decks = [
            deck for deck in cached_decks
            if all(is_card_in_deck(req_card, deck['deck']) for req_card in cards_list)
        ]

        return jsonify({
            'success': True,
            'data': matching_decks,
            'count': len(matching_decks),
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching decks: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching decks',
        }), 500
