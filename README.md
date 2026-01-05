# Clash Royale Tracker

A web application for tracking and analyzing Clash Royale player statistics, clan information, cards, and tournament data. Built with React (Vite) frontend and Flask backend, integrating with the official Clash Royale API.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Local Setup Instructions](#local-setup-instructions)
- [Running the Application](#running-the-application)
- [Testing the Application](#testing-the-application)
- [Current Features](#current-features)
- [Future Development](#future-development)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js** (v16 or higher) - [Download Node.js](https://nodejs.org/)
- **Python** (3.8 or higher) - [Download Python](https://www.python.org/downloads/)
- **Git** - [Download Git](https://git-scm.com/downloads)
- **Clash Royale API Key** - Get one from [Clash Royale API Developer Portal](https://developer.clashroyale.com/)

### Verify Installation

```bash
# Check Node.js version
node --version

# Check Python version
python3 --version  # or python --version on Windows

# Check Git version
git --version
```

## 📁 Project Structure

```
CRTrackerWebApp/
├── backend/                 # Flask backend API
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration settings
│   ├── api_key.txt         # API key (not committed to git)
│   ├── requirements.txt    # Python dependencies
│   ├── routes/             # API route blueprints
│   │   ├── player_routes.py
│   │   ├── clan_routes.py
│   │   ├── card_routes.py
│   │   └── tournament_routes.py
│   └── services/           # Service layer for API calls
│       └── clash_royale_service.py
├── frontend/               # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx         # Main app component
│   │   ├── components/     # React components
│   │   │   ├── PlayerSearch.jsx
│   │   │   ├── ClanSearch.jsx
│   │   │   ├── CardList.jsx
│   │   │   └── Leaderboard.jsx
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── app/                    # Next.js wrapper (optional)
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🚀 Local Setup Instructions

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd CRTrackerWebApp
```

### Step 2: Backend Setup

#### 2.1 Create a Virtual Environment (Recommended)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt, indicating the virtual environment is active.

#### 2.2 Install Python Dependencies

```bash
# Make sure you're in the backend directory with venv activated
pip install -r requirements.txt
```

If you encounter permission errors, try:
```bash
pip install --user -r requirements.txt
```

#### 2.3 Configure API Key

1. Get your Clash Royale API key from [https://developer.clashroyale.com/](https://developer.clashroyale.com/)
   - Sign in with your Supercell ID
   - Create a new API token
   - Copy your API key

2. Add your API key to `backend/api_key.txt`:
   ```bash
   # Open the file and replace the placeholder with your actual key
   # The file should contain only your API key (no quotes, no extra spaces)
   ```

   Example `api_key.txt` content:
   ```
   eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6...
   ```

**⚠️ Important:** Never commit `api_key.txt` to version control. It's already included in `.gitignore`.

### Step 3: Frontend Setup

#### 3.1 Install Node Dependencies

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

If you prefer using other package managers:
```bash
# Using yarn
yarn install

# Using pnpm
pnpm install
```

## 🏃 Running the Application

The application consists of two separate servers that need to run simultaneously:

### Terminal 1: Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if not already activated)
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Start Flask server
python app.py
```

The backend server will start on **http://localhost:5050**

You should see output like:
```
 * Running on http://0.0.0.0:5050
 * Debug mode: on
```

### Terminal 2: Start the Frontend Server

Open a new terminal window/tab:

```bash
# Navigate to frontend directory
cd frontend

# Start Vite development server
npm run dev
```

The frontend server will start on **http://localhost:5173** (or another port if 5173 is occupied)

You should see output like:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your web browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5050

The React frontend will automatically connect to the Flask backend API.

## 🧪 Testing the Application

### Test Backend API Directly

You can test the backend API using curl or your browser:

```bash
# Health check
curl http://localhost:5050/

# Get API info
curl http://localhost:5050/api

# Get player info (replace PLAYER_TAG with an actual tag, URL encode # as %23)
curl http://localhost:5050/api/players/%23P0LYJC8L

# Get all cards
curl http://localhost:5050/api/cards/
```

### Test Frontend Features

1. **Player Search:**
   - Enter a player tag (e.g., `#P0LYJC8L` or `P0LYJC8L`)
   - View player statistics, trophies, battle count, and current deck

2. **Clan Search:**
   - Enter a clan tag (e.g., `#2Q0J8YQV` or `2Q0J8YQV`)
   - View clan information, members, and war data

3. **Cards:**
   - Browse all Clash Royale cards
   - Filter by rarity (Common, Rare, Epic, Legendary, Champion)

4. **Leaderboard:**
   - View top players and clans

### Common Test Tags

Here are some example tags you can use for testing (these are real player/clan tags):

- Player Tag: `#P0LYJC8L` (URL encoded: `%23P0LYJC8L`)
- Clan Tag: `#2Q0J8YQV` (URL encoded: `%232Q0J8YQV`)

**Note:** Player and clan tags are case-insensitive, but the `#` symbol must be URL encoded as `%23` when used in URLs.

## ✨ Current Features

### Backend Features

- ✅ RESTful API endpoints for Clash Royale data
- ✅ Player information and statistics
- ✅ Player battle logs
- ✅ Player current deck extraction from most recent battle
- ✅ Clan information and member lists
- ✅ Clan war logs and current war status
- ✅ Complete card database
- ✅ Tournament search functionality
- ✅ CORS enabled for frontend integration
- ✅ Comprehensive error handling
- ✅ Modular architecture with Flask Blueprints
- ✅ Service layer abstraction for API calls

### Frontend Features

- ✅ Modern, responsive React UI
- ✅ Player search and statistics display
- ✅ Clan search and information display
- ✅ Card browser with rarity filtering
- ✅ Leaderboard functionality
- ✅ Tab-based navigation
- ✅ Clash Royale themed design
- ✅ Loading states and error handling
- ✅ Mobile-responsive layout

### API Endpoints

- `GET /` - Health check
- `GET /api` - API documentation
- `GET /api/players/<tag>` - Get player information
- `GET /api/players/<tag>/battlelog` - Get player battle log
- `GET /api/players/<tag>/currentdeck` - Get player's current deck from most recent battle
- `GET /api/players/<tag>/stats` - Get computed player statistics
- `GET /api/clans/<tag>` - Get clan information
- `GET /api/clans/<tag>/members` - Get clan members
- `GET /api/clans/<tag>/warlog` - Get clan war log
- `GET /api/clans/<tag>/currentwar` - Get current clan war
- `GET /api/cards/` - Get all cards
- `GET /api/cards/rarity/<rarity>` - Get cards by rarity
- `GET /api/tournaments/search?name=<name>` - Search tournaments

## 🚧 Future Development

<!-- 
  ============================================
  EDIT THIS SECTION TO ADD YOUR FUTURE PLANS
  ============================================
  
  Add your planned features, improvements, and development goals below:
-->

### Planned Features

- [ ] User authentication and profiles
- [ ] Save favorite players and clans
- [ ] Player comparison tool
- [ ] Deck builder with card recommendations
- [ ] Historical data tracking and trends
- [ ] Advanced statistics and analytics
- [ ] Push notifications for clan wars
- [ ] Mobile app version
- [ ] Social features (sharing, comments)

### Improvements

- [ ] Add data caching to reduce API calls
- [ ] Implement rate limiting protection
- [ ] Add unit and integration tests
- [ ] Performance optimization
- [ ] Enhanced error messages and user feedback
- [ ] Dark/light theme toggle
- [ ] Internationalization (i18n) support
- [ ] Accessibility improvements (WCAG compliance)

### Technical Debt

- [ ] Refactor Next.js wrapper integration (currently using both Next.js and Vite)
- [ ] Standardize on single frontend framework
- [ ] Add database for storing user preferences
- [ ] Implement API request caching layer
- [ ] Add comprehensive logging system

<!-- 
  ============================================
  END OF EDITABLE SECTION
  ============================================
-->

## 📚 API Documentation

For detailed API documentation, see:
- [Backend README](backend/README.md) - Comprehensive backend API documentation
- [Clash Royale API Docs](https://developer.clashroyale.com/api-docs) - Official API documentation

### API Base URLs

- **Backend API:** http://localhost:5050/api
- **Clash Royale API:** https://api.clashroyale.com/v1/

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🐛 Troubleshooting

### Backend Issues

**Problem: API key not found or invalid**
- Solution: Verify `backend/api_key.txt` exists and contains a valid API key
- Check that the file doesn't have extra quotes or whitespace

**Problem: Module not found errors**
- Solution: Ensure virtual environment is activated and dependencies are installed
  ```bash
  cd backend
  source venv/bin/activate
  pip install -r requirements.txt
  ```

**Problem: Port 5050 already in use**
- Solution: Change the port in `backend/app.py` or stop the process using port 5050
  ```bash
  # Find process using port 5050
  lsof -i :5050  # macOS/Linux
  netstat -ano | findstr :5050  # Windows
  
  # Kill the process or change port in app.py
  ```

**Problem: CORS errors in browser console**
- Solution: Verify backend is running and check CORS origins in `backend/config.py`

### Frontend Issues

**Problem: Cannot connect to backend API**
- Solution: Ensure backend server is running on port 5050
- Check that `API_BASE_URL` in components points to `http://localhost:5050/api`

**Problem: Module not found errors**
- Solution: Reinstall dependencies
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  ```

**Problem: Port 5173 already in use**
- Solution: Vite will automatically use the next available port, or specify a different port:
  ```bash
  npm run dev -- --port 3000
  ```

### General Issues

**Problem: Changes not reflecting**
- Solution: Restart both servers (backend and frontend)
- Clear browser cache or use hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Problem: API rate limiting**
- Solution: Clash Royale API has rate limits. Wait a few minutes and try again
- Consider implementing caching for frequently accessed data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes. Make sure to comply with Clash Royale API Terms of Service.

## 🔗 Useful Links

- [Clash Royale API Developer Portal](https://developer.clashroyale.com/)
- [Clash Royale API Documentation](https://developer.clashroyale.com/api-docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 📧 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Happy Tracking! 🎮👑**

