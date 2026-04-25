import sqlite3
import threading
import time
import logging
import os
from concurrent.futures import ThreadPoolExecutor
from services.clash_royale_service import ClashRoyaleService

logger = logging.getLogger(__name__)

# Absolute path pointing to backend/cr_data.db
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'cr_data.db')
_scheduler_started = False
REFRESH_INTERVAL_SECONDS = 1800  # 30 minutes

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS processed_battles (
            battle_id TEXT PRIMARY KEY,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS card_stats (
            card_name TEXT PRIMARY KEY,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

def _build_service(app):
    """Build a ClashRoyaleService using the given app's config."""
    return ClashRoyaleService(
        api_key=app.config['CLASH_ROYALE_API_KEY'],
        base_url=app.config['CLASH_ROYALE_API_BASE_URL'],
        timeout=app.config.get('API_REQUEST_TIMEOUT', 30),
    )

def _process_player_battle(player_data, service):
    try:
        player_tag = player_data.get('tag')
        if not player_tag:
            return None

        battle_log = service.get_player_battle_log(player_tag)
        if not battle_log or not isinstance(battle_log, list) or len(battle_log) == 0:
            return None

        for battle in battle_log:
            if battle.get('type') == 'pathOfLegend':
                battle_time = battle.get('battleTime')
                battle_id = f"{player_tag}_{battle_time}"
                return {
                    'battle_id': battle_id,
                    'battle': battle,
                    'player_tag': player_tag
                }
    except Exception:
        pass
    return None

def _fetch_and_update_winrates(app):
    init_db()
    with app.app_context():
        try:
            service = _build_service(app)
            leaderboard_data = service.get_pol_leaderboard('current')
            players = leaderboard_data.get('items', [])

            LIMIT = 1000
            players_to_check = players[:LIMIT]

            battles_to_process = []
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = [
                    executor.submit(_process_player_battle, player, service)
                    for player in players_to_check
                ]
                for future in futures:
                    result = future.result()
                    if result:
                        battles_to_process.append(result)

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()

            new_battles_count = 0
            for battle_data in battles_to_process:
                battle_id = battle_data['battle_id']
                battle = battle_data['battle']

                c.execute("SELECT 1 FROM processed_battles WHERE battle_id = ?", (battle_id,))
                if c.fetchone():
                    continue  # Already processed

                new_battles_count += 1
                c.execute("INSERT INTO processed_battles (battle_id) VALUES (?)", (battle_id,))

                team = battle.get('team', [])
                opponent = battle.get('opponent', [])

                if not team or not opponent:
                    continue
                
                team1 = team[0]
                team2 = opponent[0]

                # Identify winner
                t1_crowns = team1.get('crowns', 0)
                t2_crowns = team2.get('crowns', 0)

                if t1_crowns == t2_crowns:
                    continue # Skip ties

                team1_won = t1_crowns > t2_crowns

                t1_cards = [card.get('name') for card in team1.get('cards', []) if card.get('name')]
                t2_cards = [card.get('name') for card in team2.get('cards', []) if card.get('name')]

                if team1_won:
                    winning_cards = t1_cards
                    losing_cards = t2_cards
                else:
                    winning_cards = t2_cards
                    losing_cards = t1_cards

                for card_name in winning_cards:
                    # Using INSERT OR IGNORE then UPDATE for max compatibility across sqlite versions
                    c.execute("INSERT OR IGNORE INTO card_stats (card_name, wins, losses) VALUES (?, 0, 0)", (card_name,))
                    c.execute("UPDATE card_stats SET wins = wins + 1 WHERE card_name = ?", (card_name,))

                for card_name in losing_cards:
                    c.execute("INSERT OR IGNORE INTO card_stats (card_name, wins, losses) VALUES (?, 0, 0)", (card_name,))
                    c.execute("UPDATE card_stats SET losses = losses + 1 WHERE card_name = ?", (card_name,))

            conn.commit()
            conn.close()

            logger.info(f"Winrate update complete. Processed {new_battles_count} new battles.")

        except Exception as e:
            logger.error("Failed to update winrates: %s", e)

def _scheduler_loop(app):
    while True:
        _fetch_and_update_winrates(app)
        time.sleep(REFRESH_INTERVAL_SECONDS)

def init_winrate_tracker(app):
    global _scheduler_started
    if _scheduler_started:
        return
    _scheduler_started = True

    init_db()

    thread = threading.Thread(
        target=_scheduler_loop,
        args=(app,),
        daemon=True,
        name='winrate-scheduler',
    )
    thread.start()
    logger.info("Winrate background scheduler started (interval=%ds).", REFRESH_INTERVAL_SECONDS)

def get_current_winrates():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT card_name, wins, losses FROM card_stats")
    rows = c.fetchall()
    conn.close()

    result = {}
    for row in rows:
        result[row[0]] = {
            'wins': row[1],
            'losses': row[2]
        }
    return result
