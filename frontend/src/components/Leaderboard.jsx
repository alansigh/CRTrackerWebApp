"use client"

import { useState, useEffect } from "react"
import "./Leaderboard.css"

const API_BASE_URL = "http://localhost:5050/api"

const normalizeCardLevel = (card) => {
  // Card max levels by rarity:
  // Common: 15, Rare: 13, Epic: 10, Legendary: 8, Champion: 5
  const maxLevels = {
    common: 15,
    rare: 13,
    epic: 10,
    legendary: 8,
    champion: 5,
  }

  const rarity = card.rarity?.toLowerCase()
  const currentLevel = card.level
  const maxLevel = maxLevels[rarity]

  if (!maxLevel) {
    return currentLevel
  }

  // If card is at max level or 1 below max, it should be level 15
  if (currentLevel >= maxLevel - 1) {
    return 15
  }

  // Otherwise, scale the level proportionally to level 15
  // Formula: (currentLevel / maxLevel) * 15
  const normalizedLevel = Math.round((currentLevel / maxLevel) * 15)
  return normalizedLevel
}

const generateSeasonOptions = () => {
  const options = [{ value: "current", label: "Current Season" }]
  const currentDate = new Date()

  // Set to previous month (most recent available)
  currentDate.setMonth(currentDate.getMonth() - 1)

  // Generate 24 months of options
  for (let i = 0; i < 24; i++) {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const monthStr = month.toString().padStart(2, "0")
    const value = `${year}-${monthStr}`
    const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

    options.push({ value, label: monthName })

    // Move to previous month
    currentDate.setMonth(currentDate.getMonth() - 1)
  }

  return options
}

function Leaderboard() {
  const [season, setSeason] = useState("current")
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedPlayer, setExpandedPlayer] = useState(null)
  const [playerDecks, setPlayerDecks] = useState({})

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)
    setLeaderboardData([])

    try {
      const response = await fetch(`${API_BASE_URL}/leaderboards/pathoflegends/${season}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch leaderboard data")
      }

      const players = data.data?.items || []
      setLeaderboardData(players)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayerDeck = async (playerTag) => {
    if (playerDecks[playerTag]) {
      return
    }

    try {
      const cleanTag = playerTag.replace("#", "")
      const response = await fetch(`${API_BASE_URL}/players/${cleanTag}/currentdeck`)
      const data = await response.json()

      if (response.ok && data.success) {
        setPlayerDecks((prev) => ({
          ...prev,
          [playerTag]: data.data || [],
        }))
      }
    } catch (err) {
      console.error(`Failed to fetch deck for ${playerTag}:`, err)
    }
  }

  const togglePlayerExpansion = (playerTag) => {
    if (expandedPlayer === playerTag) {
      setExpandedPlayer(null)
    } else {
      setExpandedPlayer(playerTag)
      fetchPlayerDeck(playerTag)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [season])

  const seasonOptions = generateSeasonOptions()

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Path of Legends Leaderboard</h2>
        <div className="season-selector">
          <label htmlFor="season">Season:</label>
          <select id="season" value={season} onChange={(e) => setSeason(e.target.value)} disabled={loading}>
            {seasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading leaderboard...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && leaderboardData.length > 0 && (
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="rank-col">Rank</div>
            <div className="name-col">Player</div>
            <div className="tag-col">Tag</div>
            <div className="trophies-col">Trophies</div>
            <div className="deck-col">Deck</div>
          </div>
          <div className="table-body">
            {leaderboardData.map((player) => (
              <div key={player.tag} className="player-row-container">
                <div className="player-row">
                  <div className="rank-col">
                    <span className={`rank-badge rank-${player.rank <= 3 ? player.rank : "other"}`}>
                      #{player.rank}
                    </span>
                  </div>
                  <div className="name-col">
                    <span className="player-name">{player.name}</span>
                  </div>
                  <div className="tag-col">
                    <span className="player-tag-small">{player.tag}</span>
                  </div>
                  <div className="trophies-col">
                    <span className="trophies-value">{player.trophies?.toLocaleString()}</span>
                  </div>
                  <div className="deck-col">
                    <button className="view-deck-btn" onClick={() => togglePlayerExpansion(player.tag)}>
                      {expandedPlayer === player.tag ? "Hide Deck" : "View Players Current Deck"}
                    </button>
                  </div>
                </div>

                {expandedPlayer === player.tag && (
                  <div className="deck-expansion">
                    {playerDecks[player.tag] ? (
                      <div className="deck-cards">
                        <h4>Current Deck:</h4>
                        <div className="cards-grid">
                          {playerDecks[player.tag].map((card, idx) => (
                            <div key={idx} className="card-item">
                              <img
                                src={card.iconUrls?.medium || "/placeholder.svg"}
                                alt={card.name}
                                className="card-icon"
                              />
                              <div className="card-info">
                                <span className="card-name">{card.name}</span>
                                <span className="card-level">Lv {normalizeCardLevel(card)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="loading-deck">
                        <div className="loading-small"></div>
                        <p>Loading deck...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && leaderboardData.length === 0 && (
        <div className="empty-message">
          <p>No leaderboard data available for this season.</p>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
