"""
Flask Application Entry Point.

This is the main Flask application file that initializes the app,
registers blueprints, configures CORS for React frontend, and sets up error handling.

The application structure:
- app.py: Main application initialization
- config.py: Configuration settings
- routes/: Blueprint modules for API endpoints
- services/: Service layer for external API integration
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import config
from routes import player_bp, clan_bp, card_bp, tournament_bp, leaderboard_bp


def create_app(config_name='default'):
    """
    Application factory pattern for creating Flask app instances.
    
    This pattern allows for easy testing and configuration management.
    Different configurations can be used for development, production, etc.
    
    Args:
        config_name (str): Configuration name ('development', 'production', 'default')
    
    Returns:
        Flask: Configured Flask application instance
    """
    # Create Flask app instance
    app = Flask(__name__)
    
    # Load configuration from config.py
    app.config.from_object(config[config_name])
    
    # Enable CORS for React frontend
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    
    # Register blueprints 
    app.register_blueprint(player_bp)   
    app.register_blueprint(clan_bp)     
    app.register_blueprint(card_bp)    
    app.register_blueprint(tournament_bp)  
    app.register_blueprint(leaderboard_bp)
    
    # Root endpoint - API health check
    @app.route('/')
    def index():
        """
        Root endpoint for API health check.
        
        Returns:
            JSON response indicating the API is running
        """
        return jsonify({
            'message': 'Clash Royale Tracking App API',
            'status': 'running',
            'version': '1.0.0'
        }), 200
    
    # API info endpoint
    @app.route('/api')
    def api_info():
        """
        API information endpoint.
        
        Returns:
            JSON response with available API endpoints and documentation
        """
        return jsonify({
            'message': 'Clash Royale Tracking App API',
            'endpoints': {
                'players': {
                    'base': '/api/players',
                    'routes': [
                        'GET /api/players/<player_tag> - Get player information',
                        'GET /api/players/<player_tag>/battlelog - Get player battle log',
                        'GET /api/players/<player_tag>/stats - Get player statistics'
                    ]
                },
                'clans': {
                    'base': '/api/clans',
                    'routes': [
                        'GET /api/clans/<clan_tag> - Get clan information',
                        'GET /api/clans/<clan_tag>/members - Get clan members',
                        'GET /api/clans/<clan_tag>/warlog - Get clan war log',
                        'GET /api/clans/<clan_tag>/currentwar - Get current clan war'
                    ]
                },
                'cards': {
                    'base': '/api/cards',
                    'routes': [
                        'GET /api/cards/ - Get all cards',
                        'GET /api/cards/rarity/<rarity> - Get cards by rarity'
                    ]
                },
                'tournaments': {
                    'base': '/api/tournaments',
                    'routes': [
                        'GET /api/tournaments/search?name=<name> - Search tournaments'
                    ]
                }
            }
        }), 200
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        """
        Handle 404 Not Found errors.
        
        Args:
            error: The error object
        
        Returns:
            JSON response with error message
        """
        return jsonify({
            'success': False,
            'error': 'Endpoint not found. Check /api for available endpoints.'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """
        Handle 500 Internal Server Error.
        
        Args:
            error: The error object
        
        Returns:
            JSON response with error message
        """
        app.logger.error(f'Server error: {error}')
        return jsonify({
            'success': False,
            'error': 'Internal server error. Please try again later.'
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        """
        Handle 400 Bad Request errors.
        
        Args:
            error: The error object
        
        Returns:
            JSON response with error message
        """
        return jsonify({
            'success': False,
            'error': 'Bad request. Please check your request parameters.'
        }), 400
    
    return app


# Create app instance when running directly
# This allows the app to be imported by other modules or run directly
if __name__ == '__main__':
    # Create app with default configuration (development)
    app = create_app('default')
    
    # Run the Flask development server
    app.run(
        debug=True,          
        host='0.0.0.0',       
        port=5050             
    )
