"use client"

import { useState, useEffect } from "react"
import "./CardList.css"

const API_BASE_URL = "http://localhost:5050/api"

function CardList() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [elixirSort, setElixirSort] = useState("none")

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/cards/`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch cards")
      }

      // Backend returns: { success: true, data: { items: [...] } }
      // Extract the items array from the nested structure
      const cardsArray = data.data?.items || []
      setCards(Array.isArray(cardsArray) ? cardsArray : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredCards = Array.isArray(cards)
    ? cards
        .filter((card) => {
          if (filter === "all") return true
          return card.rarity?.toLowerCase() === filter.toLowerCase()
        })
        .sort((a, b) => {
          if (elixirSort === "ascending") {
            return (a.elixirCost || 0) - (b.elixirCost || 0)
          } else if (elixirSort === "descending") {
            return (b.elixirCost || 0) - (a.elixirCost || 0)
          }
          return 0
        })
    : []

  const getRarityColor = (rarity) => {
    const colors = {
      common: "#b0bec5",
      rare: "#ff9800",
      epic: "#9c27b0",
      legendary: "#ffd700",
      champion: "#00e5ff",
    }
    return colors[rarity?.toLowerCase()] || "#8b949e"
  }

  return (
    <div className="card-list">
      <div className="cards-header">
        <h2>Clash Royale Cards</h2>
        <div className="filter-buttons">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All
          </button>
          <button className={filter === "common" ? "active" : ""} onClick={() => setFilter("common")}>
            Common
          </button>
          <button className={filter === "rare" ? "active" : ""} onClick={() => setFilter("rare")}>
            Rare
          </button>
          <button className={filter === "epic" ? "active" : ""} onClick={() => setFilter("epic")}>
            Epic
          </button>
          <button className={filter === "legendary" ? "active" : ""} onClick={() => setFilter("legendary")}>
            Legendary
          </button>
          <button className={filter === "champion" ? "active" : ""} onClick={() => setFilter("champion")}>
            Champion
          </button>
        </div>
        <div className="sort-buttons">
          <span className="sort-label">Sort by Elixir:</span>
          <button className={elixirSort === "none" ? "active" : ""} onClick={() => setElixirSort("none")}>
            Default
          </button>
          <button className={elixirSort === "ascending" ? "active" : ""} onClick={() => setElixirSort("ascending")}>
            Low to High ⚡
          </button>
          <button className={elixirSort === "descending" ? "active" : ""} onClick={() => setElixirSort("descending")}>
            High to Low ⚡
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading cards...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="cards-grid">
          {filteredCards.map((card) => (
            <div key={card.id || card.name} className="card-item" style={{ borderColor: getRarityColor(card.rarity) }}>
              {card.iconUrls?.medium && (
                <img
                  src={card.iconUrls.medium || "/placeholder.svg"}
                  alt={card.name}
                  className="card-image"
                  loading="lazy"
                />
              )}
              <div className="card-details">
                <h4 className="card-name">{card.name}</h4>
                <span className="card-rarity" style={{ color: getRarityColor(card.rarity) }}>
                  {card.rarity}
                </span>
                {card.elixirCost !== undefined && card.elixirCost !== null && (
                  <div className="card-elixir">
                    <span className="elixir-icon">⚡</span>
                    <span className="elixir-value">{card.elixirCost}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredCards.length === 0 && (
        <div className="no-results">
          <p>No cards found for this filter</p>
        </div>
      )}
    </div>
  )
}

export default CardList
