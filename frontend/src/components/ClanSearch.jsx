"use client"

import { useState } from "react"
import "./ClanSearch.css"

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

function ClanSearch({ onPlayerSelect }) {
  const [clanTag, setClanTag] = useState("")
  const [clanData, setClanData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const searchClan = async () => {
    if (!clanTag.trim()) {
      setError("Please enter a clan tag")
      return
    }

    setLoading(true)
    setError(null)
    setClanData(null)
    setSelectedPlayer(null)

    try {
      const cleanTag = clanTag.replace("#", "")
      const response = await fetch(`${API_BASE_URL}/clans/${encodeURIComponent(cleanTag)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch clan data")
      }

      setClanData(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerClick = async (playerTag) => {
    setLoading(true)
    setError(null)

    try {
      const cleanTag = playerTag.replace("#", "")
      const response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(cleanTag)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch player data")
      }

      setSelectedPlayer(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [playerView, setPlayerView] = useState("stats")
  const [currentDeck, setCurrentDeck] = useState(null)
  const [battleLog, setBattleLog] = useState(null)
  const [loadingView, setLoadingView] = useState(false)

  const loadCurrentDeck = async () => {
    if (!selectedPlayer) return

    setLoadingView(true)
    setPlayerView("deck")

    try {
      const cleanTag = selectedPlayer.tag.replace("#", "")
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
    if (!selectedPlayer) return

    setLoadingView(true)
    setPlayerView("battlelog")

    try {
      const cleanTag = selectedPlayer.tag.replace("#", "")
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
    setPlayerView("badges")
  }

  const backToClan = () => {
    setSelectedPlayer(null)
    setPlayerView("stats")
    setCurrentDeck(null)
    setBattleLog(null)
  }

  return (
    <div className="clan-search">
      <div className="search-box">
        <h2>Search Clan</h2>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Enter clan tag (e.g., #2PP or 2PP)"
            value={clanTag}
            onChange={(e) => setClanTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchClan()}
          />
          <button onClick={searchClan} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {loading && !selectedPlayer && (
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading clan data...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {selectedPlayer ? (
        <div className="player-results">
          <button onClick={backToClan} className="back-button">
            ← Back to Clan
          </button>
          <div className="player-card">
            <div className="player-header">
              <h3>{selectedPlayer.name}</h3>
              <span className="player-tag">{selectedPlayer.tag}</span>
            </div>

            <div className="view-navigation">
              <button className={playerView === "stats" ? "active" : ""} onClick={() => setPlayerView("stats")}>
                Stats
              </button>
              <button className={playerView === "deck" ? "active" : ""} onClick={loadCurrentDeck}>
                Current Deck
              </button>
              <button className={playerView === "battlelog" ? "active" : ""} onClick={loadBattleLog}>
                Battle Log
              </button>
              <button className={playerView === "badges" ? "active" : ""} onClick={showBadges}>
                Badges
              </button>
            </div>

            {playerView === "stats" && (
              <>
                <div className="player-stats">
                  <div className="stat-item">
                    <span className="stat-label">Trophies</span>
                    <span className="stat-value gold">{selectedPlayer.trophies?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Best Trophies</span>
                    <span className="stat-value">{selectedPlayer.bestTrophies?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Level</span>
                    <span className="stat-value">{selectedPlayer.expLevel}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Wins</span>
                    <span className="stat-value green">{selectedPlayer.wins?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Losses</span>
                    <span className="stat-value red">{selectedPlayer.losses?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Three Crown Wins</span>
                    <span className="stat-value">{selectedPlayer.threeCrownWins?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Battle Count</span>
                    <span className="stat-value">{selectedPlayer.battleCount?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Win Rate</span>
                    <span className="stat-value">
                      {selectedPlayer.wins && selectedPlayer.losses
                        ? ((selectedPlayer.wins / (selectedPlayer.wins + selectedPlayer.losses)) * 100).toFixed(1)
                        : "N/A"}
                      %
                    </span>
                  </div>
                </div>

                {selectedPlayer.arena && (
                  <div className="player-arena">
                    <h4>Arena</h4>
                    <p>{selectedPlayer.arena.name}</p>
                  </div>
                )}
              </>
            )}

            {playerView === "deck" && (
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

            {playerView === "battlelog" && (
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

            {playerView === "badges" && (
              <div className="badges-view">
                <h4>Badges</h4>
                {selectedPlayer.badges && selectedPlayer.badges.length > 0 ? (
                  <div className="badges-list">
                    {selectedPlayer.badges.map((badge, index) => (
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
      ) : (
        clanData && (
          <div className="clan-results">
            <div className="clan-card">
              <div className="clan-header">
                <h3>{clanData.name}</h3>
                <span className="clan-tag">{clanData.tag}</span>
              </div>
              {clanData.description && <p className="clan-description">{clanData.description}</p>}
              <div className="clan-stats">
                <div className="stat-item">
                  <span className="stat-label">Clan Score</span>
                  <span className="stat-value gold">{clanData.clanScore?.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Members</span>
                  <span className="stat-value">
                    {clanData.members}/{clanData.memberCount || 50}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Required Trophies</span>
                  <span className="stat-value">{clanData.requiredTrophies?.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Type</span>
                  <span className="stat-value">{clanData.type || "N/A"}</span>
                </div>
              </div>
            </div>

            {clanData.memberList && clanData.memberList.length > 0 && (
              <div className="members-section">
                <h3>Clan Members (Click to view details)</h3>
                <div className="members-list">
                  {clanData.memberList
                    .sort((a, b) => (b.trophies || 0) - (a.trophies || 0))
                    .map((member, index) => (
                      <div
                        key={member.tag}
                        className="member-item clickable"
                        onClick={() => handlePlayerClick(member.tag)}
                      >
                        <span className="member-rank">#{index + 1}</span>
                        <div className="member-info">
                          <span className="member-name">{member.name}</span>
                          <span className="member-role">{member.role}</span>
                        </div>
                        <span className="member-trophies">{member.trophies?.toLocaleString()} 🏆</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}

export default ClanSearch
