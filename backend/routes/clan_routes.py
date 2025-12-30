"""
Clan Routes Blueprint.

This module defines all API endpoints related to clan data,
including clan information, members, war logs, and current wars.
"""

from flask import Blueprint, jsonify, request
from services.clash_royale_service import ClashRoyaleService
from flask import current_app

# Create a blueprint for clan-related routes
clan_bp = Blueprint('clans', __name__, url_prefix='/api/clans')


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


@clan_bp.route('/<clan_tag>', methods=['GET'])
def get_clan(clan_tag: str):
    """
    Get detailed information about a specific clan.
    
    URL Parameters:
        clan_tag (str): Clan tag (e.g., '2Q0J8YQV' or '%232Q0J8YQV')
                        The # symbol should be URL encoded as %23
    
    Returns:
        JSON response with clan information including:
        - Basic info: name, tag, description, type
        - Statistics: member count, required trophies, clan score
        - Member list: All clan members with their details
        - Location and badge information
    
    Example request:
        GET /api/clans/%232Q0J8YQV
        GET /api/clans/2Q0J8YQV
    """
    try:
        service = get_clash_royale_service()
        clan_data = service.get_clan_info(clan_tag)
        
        # TODO: Add custom data processing here
        # Example: Sort members by trophies, calculate clan statistics, filter data
        # clan_data['memberList'] = sorted(
        #     clan_data.get('memberList', []),
        #     key=lambda x: x.get('trophies', 0),
        #     reverse=True
        # )
        
        return jsonify({
            'success': True,
            'data': clan_data
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Error fetching clan {clan_tag}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching clan data'
        }), 500


@clan_bp.route('/<clan_tag>/members', methods=['GET'])
def get_clan_members(clan_tag: str):
    """
    Get list of members in a clan.
    
    URL Parameters:
        clan_tag (str): Clan tag (e.g., '2Q0J8YQV')
    
    Query Parameters (optional):
        sort_by (str): Sort members by 'trophies', 'donations', 'role' (default: 'trophies')
        order (str): Sort order 'asc' or 'desc' (default: 'desc')
    
    Returns:
        JSON response with clan member list
    
    Example request:
        GET /api/clans/%232Q0J8YQV/members?sort_by=trophies&order=desc
    """
    try:
        service = get_clash_royale_service()
        members_data = service.get_clan_members(clan_tag)
        
        # Get optional query parameters for sorting
        sort_by = request.args.get('sort_by', 'trophies')  # trophies, donations, role
        order = request.args.get('order', 'desc')  # asc or desc
        
        # TODO: Implement custom sorting logic
        # members = members_data.get('members', [])
        # reverse_order = (order == 'desc')
        # 
        # if sort_by == 'trophies':
        #     members = sorted(members, key=lambda x: x.get('trophies', 0), reverse=reverse_order)
        # elif sort_by == 'donations':
        #     members = sorted(members, key=lambda x: x.get('donations', 0), reverse=reverse_order)
        # 
        # members_data['members'] = members
        
        return jsonify({
            'success': True,
            'data': members_data
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Error fetching clan members for {clan_tag}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching clan members'
        }), 500


@clan_bp.route('/<clan_tag>/warlog', methods=['GET'])
def get_clan_war_log(clan_tag: str):
    """
    Get the war log for a specific clan.
    
    URL Parameters:
        clan_tag (str): Clan tag (e.g., '2Q0J8YQV')
    
    Returns:
        JSON response with list of recent clan wars
    
    Example request:
        GET /api/clans/%232Q0J8YQV/warlog
    
    Note: War log may be empty if the clan has no war history
    """
    try:
        service = get_clash_royale_service()
        war_log = service.get_clan_war_log(clan_tag)
        
        # TODO: Add custom processing here
        # Example: Calculate win rate, filter by date, aggregate statistics
        # win_rate = calculate_clan_war_win_rate(war_log)
        # war_log['statistics'] = {
        #     'total_wars': len(war_log.get('items', [])),
        #     'win_rate': win_rate,
        #     ...
        # }
        
        return jsonify({
            'success': True,
            'data': war_log
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Error fetching war log for {clan_tag}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching war log'
        }), 500


@clan_bp.route('/<clan_tag>/currentwar', methods=['GET'])
def get_clan_current_war(clan_tag: str):
    """
    Get information about the clan's current war.
    
    URL Parameters:
        clan_tag (str): Clan tag (e.g., '2Q0J8YQV')
    
    Returns:
        JSON response with current war information including:
        - state: Current state (e.g., 'collectionDay', 'warDay', 'ended')
        - collectionEndTime: When collection day ends
        - warEndTime: When war day ends
        - participants: List of participants
        - clans: Competing clans information
    
    Example request:
        GET /api/clans/%232Q0J8YQV/currentwar
    
    Note: Returns empty object if clan is not in war
    """
    try:
        service = get_clash_royale_service()
        current_war = service.get_clan_current_war(clan_tag)
        
        # TODO: Add custom processing here
        # Example: Calculate progress, filter participant data, format timestamps
        # if current_war.get('state') == 'warDay':
        #     progress = calculate_war_progress(current_war)
        #     current_war['progress'] = progress
        
        return jsonify({
            'success': True,
            'data': current_war
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Error fetching current war for {clan_tag}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred while fetching current war'
        }), 500


