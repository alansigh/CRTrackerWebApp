"""
Player Routes Blueprint.

This module defines all API endpoints related to player data,
including player information, battle logs, and statistics.
"""

from flask import Blueprint, jsonify, request
from services.clash_royale_service import ClashRoyaleService
from flask import current_app

# Create a blueprint for player-related routes
# This helps organize routes and makes the code more modular
player_bp = Blueprint('players', __name__, url_prefix='/api/players')


def get_clash_royale_service() -> ClashRoyaleService:
    """
    Helper function to get an initialized ClashRoyaleService instance.
    
    This retrieves configuration from Flask's current_app context
    and creates a service instance with the proper API credentials.
    
    Returns:
        ClashRoyaleService: Initialized service instance
    """
    return ClashRoyaleService(
        api_key=current_app.config['CLASH_ROYALE_API_KEY'],
        base_url=current_app.config['CLASH_ROYALE_API_BASE_URL'],
        timeout=current_app.config.get('API_REQUEST_TIMEOUT', 30)
    )


@player_bp.route('/<player_tag>', methods=['GET'])
def get_player(player_tag: str):
    """
    Get detailed information about a specific player.
    
    URL Parameters:
        player_tag (str): Player tag (e.g., 'P0LYJC8L' or '%23P0LYJC8L')
                          The # symbol should be URL encoded as %23
    
    Returns:
        JSON response with player information including:
        - Basic info: name, tag, level, trophies
        - Statistics: wins, losses, battle count
        - Clan information (if applicable)
        - Current deck and cards
    
    Example request:
        GET /api/players/%23P0LYJC8L
        GET /api/players/P0LYJC8L
    
    Example response:
        {
            "success": true,
            "data": {
                "name": "PlayerName",
                "tag": "#P0LYJC8L",
                "expLevel": 13,
                "trophies": 5000,
                ...
            }
        }
    """
    try:
        service = get_clash_royale_service()
        player_data = service.get_player_info(player_tag)
        
        # TODO: Add custom data processing here
        # Example: Transform the data, add computed fields, filter sensitive data
        # processed_data = {
        #     'name': player_data.get('name'),
        #     'trophies': player_data.get('trophies'),
        #     'win_rate': calculate_win_rate(player_data),
        #     ...
        # }
        

        return jsonify({
            'success': True,
            'data': player_data
        }), 200
        
    except ValueError as e:
        # Handle API errors (404, 403, 429, etc.)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        # Handle unexpected errors
        current_app.logger.error(f"Error fetching player {player_tag}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching player data'
        }), 500


@player_bp.route('/<player_tag>/battlelog', methods=['GET'])
def get_player_battle_log(player_tag: str):
    """
    Get the battle log for a specific player.
    
    URL Parameters:
        player_tag (str): Player tag (e.g., 'P0LYJC8L')
    
    Query Parameters (optional):
        limit (int): Number of battles to return (not implemented by API, but you can process here)
    
    Returns:
        JSON response with list of recent battles (last 25 battles)
        Each battle includes:
        - battleTime: ISO timestamp
        - type: Battle type (e.g., 'clanWar', 'PvP')
        - team: Player's team data
        - opponent: Opponent data
        - arena: Arena information
        - gameMode: Game mode details
    
    Example request:
        GET /api/players/%23P0LYJC8L/battlelog
    
    Note: Battle log is cached for 30 seconds by the Clash Royale API
    """
    try:
        service = get_clash_royale_service()
        battle_log = service.get_player_battle_log(player_tag)
        
        # Get optional query parameters
        limit = request.args.get('limit', type=int)
        
        # TODO: Add custom processing here
        # Example: Filter by battle type, calculate statistics, transform data
        # if limit:
        #     battle_log = battle_log[:limit]
        # 
        # processed_log = []
        # for battle in battle_log.get('items', []):
        #     processed_log.append({
        #         'timestamp': battle['battleTime'],
        #         'type': battle['type'],
        #         'result': 'win' if battle['team'][0]['crowns'] > battle['opponent'][0]['crowns'] else 'loss',
        #         ...
        #     })
        
        return jsonify({
            'success': True,
            'data': battle_log
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Error fetching battle log for {player_tag}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching battle log'
        }), 500

@player_bp.route('/<player_tag>/currentdeck', methods=['GET'])
def get_current_deck(player_tag: str):
    """
    Get the current deck from a player's most recent battle.
    
    This endpoint fetches the player's battle log and extracts the deck
    they used in their most recent battle. The battle log is sorted with
    the most recent battle first.
    
    URL Parameters:
        player_tag (str): Player tag (e.g., 'P0LYJC8L' or '%23P0LYJC8L')
    
    Returns:
        JSON response with the deck from the most recent battle:
        - Array of card objects with:
          - id: Card ID
          - name: Card name
          - level: Card level
          - maxLevel: Maximum card level
          - iconUrls: Card image URLs
    
    Example request:
        GET /api/players/%23P0LYJC8L/currentdeck
    
    Note: Returns an empty array if the player has no recent battles
    """
    try:
        service = get_clash_royale_service()
        # Get battle log - API returns an array directly (most recent first)
        battle_log = service.get_player_battle_log(player_tag)
        
        # Check if battle log is empty or invalid
        if not battle_log or not isinstance(battle_log, list) or len(battle_log) == 0:
            return jsonify({
                'success': True,
                'data': [],
                'message': 'No recent battles found for this player'
            }), 200
        
        # Get the most recent battle (first item in the array)
        most_recent_battle = battle_log[0]
        
        # Extract the player's deck from the team array
        # The 'team' array contains player objects, team[0] is the requesting player
        team = most_recent_battle.get('team', [])
        
        if not team or len(team) == 0:
            return jsonify({
                'success': False,
                'error': 'No team data found in the most recent battle'
            }), 404
        
        # Get the first player's deck (the requesting player)
        player_data = team[0]
        deck = player_data.get('cards', [])
        
        # TODO: Add custom processing here
        # Example: Add card details, calculate deck statistics, format data
        # You could fetch full card information from the cards endpoint
        # and merge it with the deck data for more detailed information
        
        return jsonify({
            'success': True,
            'data': deck,
            'battleTime': most_recent_battle.get('battleTime'),
            'battleType': most_recent_battle.get('type'),
            'gameMode': most_recent_battle.get('gameMode', {}).get('name')
        }), 200
        
    except ValueError as e:
        # Handle API errors (404, 403, 429, etc.)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except (KeyError, IndexError, TypeError) as e:
        # Handle data structure errors
        current_app.logger.error(f"Error parsing battle log for {player_tag}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to extract deck from battle log. Battle data structure may be invalid.'
        }), 500
        
    except Exception as e:
        # Handle unexpected errors
        current_app.logger.error(f"Error fetching current deck for {player_tag}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching current deck'
        }), 500



@player_bp.route('/<player_tag>/stats', methods=['GET'])
def get_player_stats(player_tag: str):
    """
    Get computed statistics for a player.
    
    This endpoint demonstrates how to combine multiple API calls
    and process data to create custom statistics.
    
    URL Parameters:
        player_tag (str): Player tag (e.g., 'P0LYJC8L')
    
    Returns:
        JSON response with computed player statistics
    
    Example request:
        GET /api/players/%23P0LYJC8L/stats
    """
    try:
        service = get_clash_royale_service()
        
        # Get player info
        player_info = service.get_player_info(player_tag)
        
        # Get battle log for additional statistics
        battle_log = service.get_player_battle_log(player_tag)
        
        # TODO: Implement custom statistics calculation
        # Example statistics you could compute:
        # - Win rate from battle log
        # - Average trophies per battle
        # - Most used cards
        # - Favorite game mode
        # - Trophy progression over time
        # - Best performing deck
        
        # Placeholder for custom statistics
        stats = {
            'player_tag': player_info.get('tag'),
            'player_name': player_info.get('name'),
            'current_trophies': player_info.get('trophies'),
            'best_trophies': player_info.get('bestTrophies'),
            'total_battles': player_info.get('battleCount', 0),
            'total_wins': player_info.get('wins', 0),
            'total_losses': player_info.get('losses', 0),
            # Add computed fields here
            # 'win_rate': calculate_win_rate(player_info, battle_log),
            # 'recent_battles': len(battle_log.get('items', [])),
            # ...
        }
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Error fetching stats for {player_tag}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching player stats'
        }), 500


