"use client"

import { useState } from "react"
import "./ClanSearch.css"

const API_BASE_URL = "http://localhost:5050/api"

function ClanSearch() {
  const [clanTag, setClanTag] = useState("")
  const [clanData, setClanData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchClan = async () => {
    if (!clanTag.trim()) {
      setError("Please enter a clan tag")
      return
    }

    setLoading(true)
    setError(null)
    setClanData(null)

    try {
      const cleanTag = clanTag.replace("#", "")
      const response = await fetch(`${API_BASE_URL}/clans/${encodeURIComponent(cleanTag)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch clan data")
      }

      setClanData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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

      {loading && (
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

      {clanData && (
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
              <h3>Top Members</h3>
              <div className="members-list">
                {clanData.memberList.slice(0, 10).map((member, index) => (
                  <div key={member.tag} className="member-item">
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
      )}
    </div>
  )
}

export default ClanSearch
