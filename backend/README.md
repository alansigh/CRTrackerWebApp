# Clash Royale Tracking App - Backend

Flask backend API for the Clash Royale Tracking App. This backend provides RESTful API endpoints to interact with the Clash Royale API and serve data to the React frontend.

## Features

- RESTful API endpoints for player, clan, card, and tournament data
- Integration with Clash Royale Official API (https://api.clashroyale.com/v1/)
- CORS enabled for React frontend integration
- Modular architecture using Flask Blueprints
- Comprehensive error handling
- Service layer for API abstraction
- Extensive code documentation

## Project Structure

```
backend/
├── app.py                 # Main Flask application entry point
├── config.py              # Configuration settings and API key management
├── api_key.txt            # Clash Royale API key (not committed to git)
├── requirements.txt       # Python dependencies
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── routes/               # API route blueprints
│   ├── __init__.py
│   ├── player_routes.py  # Player-related endpoints
│   ├── clan_routes.py    # Clan-related endpoints
│   ├── card_routes.py    # Card-related endpoints
│   └── tournament_routes.py  # Tournament-related endpoints
└── services/             # Service layer for external API calls
    ├── __init__.py
    └── clash_royale_service.py  # Clash Royale API service
```

## Setup Instructions

### 1. Install Python Dependencies

Make sure you have Python 3.8+ installed, then install the required packages:

```bash
cd backend
pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Get Your Clash Royale API Key

1. Go to https://developer.clashroyale.com/
2. Sign in with your Supercell ID
3. Create a new API token
4. Copy your API key

### 3. Configure API Key

Open `api_key.txt` and replace `YOUR_CLASH_ROYALE_API_KEY_HERE` with your actual API key:

```
your-actual-api-key-here
```

**Important:** Never commit `api_key.txt` to version control. It's already included in `.gitignore`.

### 4. Run the Flask Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Base URL
```
http://localhost:5000
```

### Available Endpoints

#### Player Endpoints
- `GET /api/players/<player_tag>` - Get player information
- `GET /api/players/<player_tag>/battlelog` - Get player battle log
- `GET /api/players/<player_tag>/stats` - Get computed player statistics

**Example:**
```bash
curl http://localhost:5000/api/players/%23P0LYJC8L
```

#### Clan Endpoints
- `GET /api/clans/<clan_tag>` - Get clan information
- `GET /api/clans/<clan_tag>/members` - Get clan members
- `GET /api/clans/<clan_tag>/warlog` - Get clan war log
- `GET /api/clans/<clan_tag>/currentwar` - Get current clan war

**Example:**
```bash
curl http://localhost:5000/api/clans/%232Q0J8YQV
```

#### Card Endpoints
- `GET /api/cards/` - Get all cards
- `GET /api/cards/rarity/<rarity>` - Get cards filtered by rarity

**Example:**
```bash
curl http://localhost:5000/api/cards/
curl http://localhost:5000/api/cards/rarity/Legendary
```

#### Tournament Endpoints
- `GET /api/tournaments/search?name=<tournament_name>` - Search tournaments

**Example:**
```bash
curl "http://localhost:5000/api/tournaments/search?name=Grand%20Challenge"
```

### API Information
- `GET /` - Health check
- `GET /api` - API documentation and available endpoints

## Player Tag Format

Player tags and clan tags in Clash Royale start with `#`. When using them in URLs:
- URL encode `#` as `%23`
- Or remove the `#` symbol (the API accepts both formats)

**Examples:**
- Player tag: `#P0LYJC8L`
- URL encoded: `%23P0LYJC8L`
- In URL: `/api/players/%23P0LYJC8L`

## Connecting to React Frontend

The backend is configured to accept requests from the React frontend:

- **Development:** The CORS origins include `http://localhost:5173` (Vite default) and `http://localhost:3000`
- **Frontend Configuration:** Your React app should make API calls to `http://localhost:5000/api/...`

### Example React Fetch Call

```javascript
// In your React component
const fetchPlayerData = async (playerTag) => {
  try {
    const encodedTag = encodeURIComponent(playerTag); // Encodes # as %23
    const response = await fetch(`http://localhost:5000/api/players/${encodedTag}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(data.data);
    } else {
      console.error(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Customization

The codebase includes extensive comments and TODO markers indicating where you can add custom implementations:

1. **Data Processing:** Each route handler has TODO comments for custom data transformation
2. **Statistics:** Example endpoints like `/api/players/<tag>/stats` show how to combine multiple API calls
3. **Service Layer:** The `ClashRoyaleService` class can be extended with additional methods
4. **Error Handling:** Custom error responses can be added in route handlers

## Development Best Practices

1. **Virtual Environment:** Always use a virtual environment for Python projects
2. **API Key Security:** Never commit API keys to version control
3. **Error Handling:** All endpoints include proper error handling
4. **Logging:** Use Flask's logging for debugging: `current_app.logger.error(...)`
5. **Code Organization:** Follow the blueprint pattern for organizing routes

## Production Deployment

For production deployment:

1. Set environment variables:
   ```bash
   export FLASK_ENV=production
   export SECRET_KEY=your-secret-key-here
   ```

2. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. Update CORS origins in `config.py` to include your production frontend URL

4. Use environment variables or secure secret management for API keys in production

## Clash Royale API Documentation

For more information about the Clash Royale API, visit:
- Official API Docs: https://developer.clashroyale.com/api-docs
- API Base URL: https://api.clashroyale.com/v1/

## License

This project is for educational purposes. Make sure to comply with Clash Royale API Terms of Service.

## Troubleshooting

### API Key Issues
- Make sure `api_key.txt` exists and contains a valid API key
- Verify the API key is active on https://developer.clashroyale.com/
- Check that the API key hasn't expired

### CORS Errors
- Ensure the frontend URL is included in `CORS_ORIGINS` in `config.py`
- Check that CORS is properly configured in `app.py`

### Connection Errors
- Verify the Flask server is running on port 5000
- Check firewall settings if accessing from a different machine
- Ensure the Clash Royale API is accessible from your network


