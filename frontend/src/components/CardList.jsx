"use client"

import { useState, useEffect } from "react"
import { Archive, Filter, ArrowUpDown, Zap } from "lucide-react"

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

  const getRarityColorClass = (rarity) => {
    const colors = {
      common: "text-slate-400 border-slate-400/50 hover:border-slate-400",
      rare: "text-orange-400 border-orange-400/50 hover:border-orange-400",
      epic: "text-purple-400 border-purple-400/50 hover:border-purple-400",
      legendary: "text-champagne border-champagne/50 hover:border-champagne",
      champion: "text-cyan-400 border-cyan-400/50 hover:border-cyan-400",
    }
    return colors[rarity?.toLowerCase()] || "text-slate-400 border-slate-400/50"
  }

  return (
    <div className="w-full flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Control Panel */}
      <div className="bg-[#12121A] rounded-[2rem] border border-slate-light p-6 md:p-8 shadow-skeuo-outset">
        <h2 className="font-sans font-bold text-2xl text-ivory flex items-center gap-3 mb-6">
          <Archive className="text-champagne" size={24} />
          CARD ARCHIVE
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          
          {/* Filters */}
          <div className="flex-1">
            <h3 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Filter size={12} /> Rarity Filter
            </h3>
            <div className="flex flex-wrap gap-2 p-1 bg-obsidian rounded-xl shadow-skeuo-inset border border-slate-light/30">
              {['all', 'common', 'rare', 'epic', 'legendary', 'champion'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-mono text-xs uppercase transition-all duration-300 flex-1 md:flex-none ${
                    filter === f 
                      ? 'bg-slate-light text-ivory shadow-skeuo-button-pressed font-bold' 
                      : 'text-slate-400 hover:text-ivory hover:bg-slate-light/20'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Sorters */}
          <div>
            <h3 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ArrowUpDown size={12} /> Elixir Sort
            </h3>
            <div className="flex flex-wrap gap-2 p-1 bg-obsidian rounded-xl shadow-skeuo-inset border border-slate-light/30">
              {[
                { id: 'none', label: 'DEFAULT' },
                { id: 'ascending', label: 'ASC (▲)' },
                { id: 'descending', label: 'DESC (▼)' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setElixirSort(s.id)}
                  className={`px-4 py-2 rounded-lg font-mono text-xs uppercase transition-all duration-300 ${
                    elixirSort === s.id 
                      ? 'bg-champagne text-obsidian shadow-glow-champagne font-bold' 
                      : 'text-slate-400 hover:text-ivory hover:bg-slate-light/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="font-mono text-champagne text-glow-champagne text-center tracking-widest animate-pulse p-12">
          COMPILING CARD DATABASE...
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 text-red-400 font-mono text-center shadow-skeuo-inset">
          [ERR] {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="font-mono text-xs text-slate-500 mb-2 pl-4 border-l-2 border-champagne/30">
            INDEXING {filteredCards.length} RECORDS
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredCards.map((card) => {
              const rarityClasses = getRarityColorClass(card.rarity);
              return (
                <div 
                  key={card.id || card.name} 
                  className={`bg-[#181822] rounded-2xl border-2 p-4 flex flex-col items-center justify-between shadow-skeuo-outset group hover:-translate-y-2 hover:scale-[1.05] transition-all duration-300 cursor-pointer ${rarityClasses}`}
                >
                  <div className="absolute top-2 left-2 flex items-center justify-center w-6 h-6 rounded-full bg-obsidian border border-slate-light shadow-skeuo-inset font-mono text-[10px] text-ivory">
                    {card.elixirCost !== undefined ? card.elixirCost : '?'}
                    <Zap size={8} className="text-purple-400 ml-[1px]" />
                  </div>
                  
                  {card.iconUrls?.medium && (
                    <div className="relative w-full aspect-[3/4] mt-6 mb-4 select-none">
                      <img
                        src={card.iconUrls.medium}
                        alt={card.name}
                        className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_20px_20px_rgba(201,168,76,0.3)] transition-all duration-300"
                        loading="lazy"
                        draggable="false"
                      />
                    </div>
                  )}
                  
                  <div className="w-full text-center">
                    <h4 className="font-sans font-bold text-sm text-ivory leading-tight truncate px-1">{card.name}</h4>
                    <span className="font-mono text-[9px] uppercase tracking-widest mt-1 block opacity-80">{card.rarity}</span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {filteredCards.length === 0 && (
            <div className="bg-obsidian border border-slate-light/30 rounded-xl p-12 text-center font-mono text-slate-500 shadow-skeuo-inset">
              NO RECORDS FOUND MATCHING CURRENT FILTER PARAMETERS.
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CardList
