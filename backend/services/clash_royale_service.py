"""
Clash Royale API Service Module.

This module provides a service layer for interacting with the Clash Royale API.
It handles HTTP requests, error handling, and data transformation.

The Clash Royale API documentation: https://developer.clashroyale.com/api-docs
"""

import requests
from typing import Dict, Any, Optional
from flask import current_app


class ClashRoyaleService:
    """
    Service class for interacting with the Clash Royale API.
    
    This class encapsulates all API communication logic, including:
    - Making HTTP requests to the Clash Royale API
    - Handling authentication headers
    - Error handling and retries
    - Response parsing and transformation
    """
    
    def __init__(self, api_key: str, base_url: str, timeout: int = 30):
        """
        Initialize the Clash Royale API service.
        
        Args:
            api_key (str): Your Clash Royale API key
            base_url (str): Base URL for the Clash Royale API
            timeout (int): Request timeout in seconds (default: 30)
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        
        # Set default headers for all requests
        # The Clash Royale API requires authentication via Authorization header
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Accept': 'application/json'
        })
    
    def _make_request(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Internal method to make HTTP requests to the Clash Royale API.
        
        Args:
            endpoint (str): API endpoint path (e.g., 'players/{playerTag}')
            params (dict): Optional query parameters for the request
            
        Returns:
            dict: JSON response from the API
            
        Raises:
            requests.exceptions.RequestException: If the API request fails
            ValueError: If the API returns an error response
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()  # Raises an HTTPError for bad responses
            return response.json()
        except requests.exceptions.Timeout:
            raise requests.exceptions.RequestException("Request to Clash Royale API timed out")
        except requests.exceptions.HTTPError as e:
            # Handle specific HTTP errors
            if response.status_code == 404:
                raise ValueError("Resource not found. Check the player tag or clan tag.")
            elif response.status_code == 403:
                raise ValueError("Access forbidden. Check your API key.")
            elif response.status_code == 429:
                raise ValueError("Rate limit exceeded. Please try again later.")
            else:
                raise ValueError(f"API request failed with status {response.status_code}: {response.text}")
        except requests.exceptions.RequestException as e:
            raise requests.exceptions.RequestException(f"Failed to connect to Clash Royale API: {str(e)}")
    
    def get_player_info(self, player_tag: str) -> Dict[str, Any]:
        """
        Get information about a specific player.
        
        Args:
            player_tag: Player tag (e.g., '#P0LYJC8L' or 'P0LYJC8L')
                        Tags should be URL encoded (use %23 for #)
        
        Returns:
            dict: Player information including:
                - name, tag, expLevel, trophies, bestTrophies
                - wins, losses, battleCount
                - clan information
                - cards, currentDeck
                - achievements, etc.
        
        Example response fields you can use:
            - player['name']: Player name
            - player['trophies']: Current trophies
            - player['bestTrophies']: Personal best trophies
            - player['wins']: Total wins
            - player['battleCount']: Total battles
            - player['clan']: Clan information if in a clan
            - player['currentDeck']: Current deck cards
        """
        # Remove # from tag if present and URL encode
        if player_tag.startswith('#'):
            player_tag = '%23' + player_tag[1:]
        else :
            player_tag = '%23'+player_tag
        
        endpoint = f"players/{player_tag}"
        return self._make_request(endpoint)
    
    def get_player_battle_log(self, player_tag: str) -> Dict[str, Any]:
        """
        Get the battle log for a specific player.
        
        Args:
            player_tag: Player tag (e.g., '#P0LYJC8L' or 'P0LYJC8L')
        
        Returns:
            dict: Battle log containing list of recent battles with:
                - battleTime: Timestamp of the battle
                - type: Type of battle
                - team: Player's team information
                - opponent: Opponent information
                - arena: Arena information
        
        Note: Battle log only includes last 25 battles and is cached for 30 seconds.
        """
        if player_tag.startswith('#'):
            player_tag = '%23' + player_tag[1:]
        else :
            player_tag = '%23'+player_tag
        endpoint = f"players/{player_tag}/battlelog"
        return self._make_request(endpoint)
    
    def get_clan_info(self, clan_tag: str) -> Dict[str, Any]:
        """
        Get information about a specific clan.
        
        Args:
            clan_tag: Clan tag (e.g., '#2Q0J8YQV' or '2Q0J8YQV')
        
        Returns:
            dict: Clan information including:
                - name, tag, type, description
                - memberCount, requiredTrophies
                - clanScore, clanWarTrophies
                - location, badgeUrls
                - memberList: List of all clan members
        """
        clean_tag = clan_tag.replace('#', '').upper()
        encoded_tag = clean_tag.replace('#', '%23')
        
        endpoint = f"clans/{encoded_tag}"
        return self._make_request(endpoint)
    
    def get_clan_members(self, clan_tag: str) -> Dict[str, Any]:
        """
        Get list of members in a clan.
        
        This is actually part of the clan info response, but provided
        as a convenience method if you want to work with just members.
        
        Args:
            clan_tag: Clan tag (e.g., '#2Q0J8YQV' or '2Q0J8YQV')
        
        Returns:
            dict: Clan member list with member details
        """
        clan_info = self.get_clan_info(clan_tag)
        return {
            'members': clan_info.get('memberList', []),
            'memberCount': clan_info.get('memberCount', 0)
        }
    
    def get_clan_war_log(self, clan_tag: str) -> Dict[str, Any]:
        """
        Get the war log for a specific clan.
        
        Args:
            clan_tag: Clan tag (e.g., '#2Q0J8YQV' or '2Q0J8YQV')
        
        Returns:
            dict: War log containing list of recent clan wars
        """
        clean_tag = clan_tag.replace('#', '').upper()
        encoded_tag = clean_tag.replace('#', '%23')
        
        endpoint = f"clans/{encoded_tag}/warlog"
        return self._make_request(endpoint)
    
    def get_clan_current_war(self, clan_tag: str) -> Dict[str, Any]:
        """
        Get information about the clan's current war.
        
        Args:
            clan_tag: Clan tag (e.g., '#2Q0J8YQV' or '2Q0J8YQV')
        
        Returns:
            dict: Current war information including:
                - state: Current state of the war
                - collectionEndTime: When collection day ends
                - warEndTime: When war day ends
                - participants: List of participants
                - clans: Competing clans information
        """
        clean_tag = clan_tag.replace('#', '').upper()
        encoded_tag = clean_tag.replace('#', '%23')
        
        endpoint = f"clans/{encoded_tag}/currentwar"
        return self._make_request(endpoint)
    
    def get_cards(self) -> Dict[str, Any]:
        """
        Get list of all cards in Clash Royale.
        
        Returns:
            dict: List of all cards with:
                - id: Card ID
                - name: Card name
                - maxLevel: Maximum level
                - iconUrls: Card image URLs
                - rarity: Card rarity
        """
        endpoint = "cards"
        return self._make_request(endpoint)
    
    def get_pol_leaderboard(self, season: str) -> Dict[str, Any]:
        if (season == 'current'):
            endpoint = "locations/global/pathoflegend/players"
            return self._make_request(endpoint)
        else:
            endpoint = f'locations/global/pathoflegend/{season}/rankings/players'
            return self._make_request(endpoint)

    def get_tournaments(self, name: str) -> Dict[str, Any]:
        """
        Search for tournaments by name.
        
        Args:
            name: Tournament name to search for
        
        Returns:
            dict: List of tournaments matching the search name
        """
        endpoint = "tournaments"
        params = {'name': name}
        return self._make_request(endpoint, params=params)
    
    def get_popular_clans(self, limit: int = 200) -> Dict[str, Any]:
        """
        Get list of popular clans (sorted by clan score).
        
        Args:
            limit: Number of clans to return (default: 200, max: 200)
        
        Returns:
            dict: List of popular clans
        """
        endpoint = "clans"
        params = {'minScore': 40000, 'limit': min(limit, 200)}
        return self._make_request(endpoint, params=params)


# TODO: Add custom data processing methods here
# Example methods you might want to implement:
# - get_player_statistics_summary(player_tag): Process player data into custom format
# - get_clan_war_statistics(clan_tag): Analyze clan war performance
# - compare_players(player_tag1, player_tag2): Compare two players
# - get_player_win_rate(player_tag): Calculate win rate from battle log
# - get_top_performers_in_clan(clan_tag): Get best players in a clan
# - track_player_progress(player_tag): Track trophy progression over time

