"use client"

import { useState } from "react"
import "./PlayerSearch.css"

const API_BASE_URL = "http://localhost:5050/api"

const calculateDisplayLevel = (card) => {
  const maxLevels = {
    common: 15,
    rare: 13,
    epic: 10,
    legendary: 8,
    champion: 5,
  }

  const rarity = card.rarity?.toLowerCase()
  const currentLevel = card.level
  const maxLevel = card.maxLevel || maxLevels[rarity]

  if (!maxLevel) {
    return currentLevel
  }

  // Formula: displayLevel = 16 - (maxLevel - currentLevel)
  const displayLevel = 16 - (maxLevel - currentLevel)
  return displayLevel
}

function PlayerSearch() {
  const [playerTag, setPlayerTag] = useState("")
  const [playerData, setPlayerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState("stats") // stats, deck, battlelog, badges
  const [currentDeck, setCurrentDeck] = useState(null)
  const [battleLog, setBattleLog] = useState(null)
  const [loadingView, setLoadingView] = useState(false)

  const searchPlayer = async () => {
    if (!playerTag.trim()) {
      setError("Please enter a player tag")
      return
    }

    setLoading(true)
    setError(null)
    setPlayerData(null)
    setCurrentView("stats")
    setCurrentDeck(null)
    setBattleLog(null)

    try {
      const cleanTag = playerTag.replace("#", "")
      const response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(cleanTag)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch player data")
      }

      setPlayerData(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentDeck = async () => {
    if (!playerData) return

    setLoadingView(true)
    setCurrentView("deck")

    try {
      const cleanTag = playerData.tag.replace("#", "")
      const response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(cleanTag)}/currentdeck`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch current deck")
      }

      setCurrentDeck(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingView(false)
    }
  }

  const loadBattleLog = async () => {
    if (!playerData) return

    setLoadingView(true)
    setCurrentView("battlelog")

    try {
      const cleanTag = playerData.tag.replace("#", "")
      const response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(cleanTag)}/battlelog`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch battle log")
      }

      setBattleLog(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingView(false)
    }
  }

  const showBadges = () => {
    setCurrentView("badges")
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

            <div className="view-navigation">
              <button className={currentView === "stats" ? "active" : ""} onClick={() => setCurrentView("stats")}>
                Stats
              </button>
              <button className={currentView === "deck" ? "active" : ""} onClick={loadCurrentDeck}>
                Current Deck
              </button>
              <button className={currentView === "battlelog" ? "active" : ""} onClick={loadBattleLog}>
                Battle Log
              </button>
              <button className={currentView === "badges" ? "active" : ""} onClick={showBadges}>
                Badges
              </button>
            </div>

            {currentView === "stats" && (
              <>
                <div className="player-stats">
                  <div className="stat-item">
                    <span className="stat-label">Trophies</span>
                    <span className="stat-value gold">{playerData.trophies?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Best Trophies</span>
                    <span className="stat-value">{playerData.bestTrophies?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Level</span>
                    <span className="stat-value">{playerData.expLevel}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Wins</span>
                    <span className="stat-value green">{playerData.wins?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Losses</span>
                    <span className="stat-value red">{playerData.losses?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Three Crown Wins</span>
                    <span className="stat-value">{playerData.threeCrownWins?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Battle Count</span>
                    <span className="stat-value">{playerData.battleCount?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Win Rate</span>
                    <span className="stat-value">
                      {playerData.wins && playerData.losses
                        ? ((playerData.wins / (playerData.wins + playerData.losses)) * 100).toFixed(1)
                        : "N/A"}
                      %
                    </span>
                  </div>
                </div>

                {playerData.clan && (
                  <div className="player-clan">
                    <h4>Clan</h4>
                    <p>{playerData.clan.name}</p>
                    <span className="clan-tag">{playerData.clan.tag}</span>
                  </div>
                )}

                {playerData.arena && (
                  <div className="player-arena">
                    <h4>Arena</h4>
                    <p>{playerData.arena.name}</p>
                  </div>
                )}
              </>
            )}

            {currentView === "deck" && (
              <div className="deck-view">
                {loadingView ? (
                  <div className="loading-container">
                    <div className="loading"></div>
                    <p>Loading deck...</p>
                  </div>
                ) : currentDeck ? (
                  <>
                    <h4>Current Deck</h4>
                    <div className="deck-cards">
                      {currentDeck.map((card, index) => (
                        <div key={index} className="deck-card-item">
                          {card.iconUrls?.medium && (
                            <img src={card.iconUrls.medium || "/placeholder.svg"} alt={card.name} />
                          )}
                          <div className="card-details">
                            <span className="card-name">{card.name}</span>
                            <span className="card-level">Level {calculateDisplayLevel(card)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>No deck data available</p>
                )}
              </div>
            )}

            {currentView === "battlelog" && (
              <div className="battlelog-view">
                {loadingView ? (
                  <div className="loading-container">
                    <div className="loading"></div>
                    <p>Loading battle log...</p>
                  </div>
                ) : battleLog && battleLog.length > 0 ? (
                  <>
                    <h4>Recent Battles</h4>
                    <div className="battle-list">
                      {battleLog.slice(0, 10).map((battle, index) => (
                        <div key={index} className="battle-item">
                          <div className="battle-info">
                            <span className="battle-type">{battle.type}</span>
                            <span className="battle-time">{new Date(battle.battleTime).toLocaleString()}</span>
                          </div>
                          <div className="battle-result">
                            {battle.team && battle.opponent && (
                              <>
                                <span
                                  className={`crowns ${battle.team[0]?.crowns > battle.opponent[0]?.crowns ? "win" : "loss"}`}
                                >
                                  {battle.team[0]?.crowns || 0} - {battle.opponent[0]?.crowns || 0}
                                </span>
                                <span
                                  className={
                                    battle.team[0]?.crowns > battle.opponent[0]?.crowns ? "result-win" : "result-loss"
                                  }
                                >
                                  {battle.team[0]?.crowns > battle.opponent[0]?.crowns ? "WIN" : "LOSS"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>No battle log available</p>
                )}
              </div>
            )}

            {currentView === "badges" && (
              <div className="badges-view">
                <h4>Badges</h4>
                {playerData.badges && playerData.badges.length > 0 ? (
                  <div className="badges-list">
                    {playerData.badges.map((badge, index) => (
                      <div key={index} className="badge-item">
                        {badge.iconUrls?.large && (
                          <img src={badge.iconUrls.large || "/placeholder.svg"} alt={badge.name} />
                        )}
                        <div className="badge-details">
                          <span className="badge-name">{badge.name}</span>
                          {badge.progress && (
                            <span className="badge-progress">
                              Progress: {badge.progress}/{badge.target || badge.maxLevel}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No badges earned yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerSearch
