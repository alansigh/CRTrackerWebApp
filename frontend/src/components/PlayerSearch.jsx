"use client"

import { useState } from "react"
import "./PlayerSearch.css"

const API_BASE_URL = "http://localhost:5050/api"

function PlayerSearch() {
  const [playerTag, setPlayerTag] = useState("")
  const [playerData, setPlayerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchPlayer = async () => {
    if (!playerTag.trim()) {
      setError("Please enter a player tag")
      return
    }

    setLoading(true)
    setError(null)
    setPlayerData(null)

    try {
      // Remove # if present and encode the tag
      const cleanTag = playerTag.replace("#", "")
      const response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(cleanTag)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch player data")
      }

      setPlayerData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="player-search">
      <div className="search-box">
        <h2>Search Player</h2>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Enter player tag (e.g., #2PP or 2PP)"
            value={playerTag}
            onChange={(e) => setPlayerTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchPlayer()}
          />
          <button onClick={searchPlayer} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading player data...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {playerData && (
        <div className="player-results">
          <div className="player-card">
            <div className="player-header">
              <h3>{playerData.name}</h3>
              <span className="player-tag">{playerData.tag}</span>
            </div>
            <div className="player-stats">
              <div className="stat-item">
                <span className="stat-label">Trophies</span>
                <span className="stat-value gold">{playerData.trophies?.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Level</span>
                <span className="stat-value">{playerData.expLevel}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Wins</span>
                <span className="stat-value">{playerData.wins?.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Losses</span>
                <span className="stat-value">{playerData.losses?.toLocaleString()}</span>
              </div>
            </div>
            {playerData.clan && (
              <div className="player-clan">
                <h4>Clan</h4>
                <p>{playerData.clan.name}</p>
                <span className="clan-tag">{playerData.clan.tag}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerSearch
