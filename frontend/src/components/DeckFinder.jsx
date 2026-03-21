"use client"

import { useState, useEffect } from "react"
import { Search, ArrowUpDown } from "lucide-react"

const API_BASE_URL = "http://localhost:5050/api"

function DeckFinder() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortType, setSortType] = useState('none')
  const [sortDir, setSortDir] = useState('asc')
  const [selectedCards, setSelectedCards] = useState([])
  const [foundDecks, setFoundDecks] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    setLoading(true)
    setError(null)

    try {
      const [cardsRes, evosRes, heroesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cards/`),
        fetch(`${API_BASE_URL}/cards/ability/evolution`),
        fetch(`${API_BASE_URL}/cards/ability/heroes`)
      ])

      const cardsData = await cardsRes.json()
      const evosData = await evosRes.json()
      const heroesData = await heroesRes.json()

      if (!cardsRes.ok || !cardsData.success) throw new Error(cardsData.error || "Failed to fetch cards")
      if (!evosRes.ok || !evosData.success) throw new Error(evosData.error || "Failed to fetch evolutions")
      if (!heroesRes.ok || !heroesData.success) throw new Error(heroesData.error || "Failed to fetch heroes")

      const normalCards = Array.isArray(cardsData.data?.items) ? cardsData.data.items : []
      const evoCards = Array.isArray(evosData.data?.items) ? evosData.data.items : []
      const heroCards = Array.isArray(heroesData.data?.items) ? heroesData.data.items : []

      const normalizedEvos = evoCards.map(c => ({
        ...c,
        displayId: `evo-${c.id}`,
        displayIcon: c.iconUrls?.evolutionMedium || c.iconUrls?.medium,
        type: 'evolution'
      }))
      
      const normalizedHeroes = heroCards.map(c => ({
        ...c,
        displayId: `hero-${c.id}`,
        displayIcon: c.iconUrls?.heroMedium || c.iconUrls?.medium,
        type: 'hero'
      }))

      const normalizedNormal = normalCards.map(c => ({
        ...c,
        displayId: `normal-${c.id}`,
        displayIcon: c.iconUrls?.medium,
        type: 'normal'
      }))

      setCards([...normalizedEvos, ...normalizedHeroes, ...normalizedNormal])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRarityValue = (rarity) => {
    const values = { common: 1, rare: 2, epic: 3, legendary: 4, champion: 5 }
    return values[rarity?.toLowerCase()] || 0
  }

  const sortedCards = [...cards].sort((a, b) => {
    if (sortType === 'none') return 0
    
    let comparison = 0
    if (sortType === 'elixir') {
      comparison = (a.elixirCost || 0) - (b.elixirCost || 0)
    } else if (sortType === 'rarity') {
      comparison = getRarityValue(a.rarity) - getRarityValue(b.rarity)
    }
    
    return sortDir === 'asc' ? comparison : -comparison
  })

  const toggleCardSelection = (card) => {
    const isSelected = selectedCards.some(c => c.displayId === card.displayId)
    if (isSelected) {
      setSelectedCards(selectedCards.filter(c => c.displayId !== card.displayId))
    } else {
      if (selectedCards.length < 8) {
        setSelectedCards([...selectedCards, card])
      }
    }
  }

  const handleSearch = async () => {
    if (selectedCards.length === 0) return;
    
    setSearching(true);
    setSearchError(null);
    setFoundDecks([]);

    try {
      const cardsParam = selectedCards.map(c => {
        if (c.type === 'evolution') return `1${c.name}`;
        if (c.type === 'hero') return `2${c.name}`;
        return c.name;
      }).join(',');

      const response = await fetch(`${API_BASE_URL}/decks/?cards=${encodeURIComponent(cardsParam)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to find decks");
      }

      setFoundDecks(data.data || []);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-[#12121A] rounded-[2rem] border border-champagne/30 p-6 md:p-8 shadow-[0_0_20px_rgba(201,168,76,0.1)]">
        <h2 className="font-sans font-bold text-2xl text-ivory flex items-center gap-3 mb-6">
          <Search className="text-champagne" size={24} />
          FIND DECKS IN TOP 1000 PLAYERS
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <p className="font-mono text-sm text-champagne/60 uppercase tracking-widest pl-9">
            Select cards to filter top ladder decks ({selectedCards.length}/8)
          </p>

          <div className="flex flex-wrap gap-6 items-end">
            {/* Sort Dropdown */}
            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ArrowUpDown size={12} /> Sort Options
              </h3>
              <div className="relative">
                <select 
                  className="appearance-none bg-obsidian text-champagne font-mono text-sm px-6 py-3 pr-10 rounded-xl border border-champagne/30 shadow-skeuo-inset outline-none focus:border-champagne focus:shadow-glow-champagne transition-all cursor-pointer truncate"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'none') {
                      setSortType('none');
                    } else {
                      const [type, dir] = val.split('-');
                      setSortType(type);
                      setSortDir(dir);
                    }
                  }}
                  value={sortType === 'none' ? 'none' : `${sortType}-${sortDir}`}
                >
                  <option value="none">DEFAULT SORT</option>
                  <option value="elixir-asc">ELIXIR: ASCENDING (▲)</option>
                  <option value="elixir-desc">ELIXIR: DESCENDING (▼)</option>
                  <option value="rarity-asc">RARITY: ASCENDING (▲)</option>
                  <option value="rarity-desc">RARITY: DESCENDING (▼)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-champagne">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="font-mono text-champagne text-center tracking-widest animate-pulse p-12 drop-shadow-[0_0_10px_rgba(201,168,76,0.8)]">
          INITIALIZING DECK FINDER PROTOCOLS...
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 text-red-400 font-mono text-center shadow-skeuo-inset">
          [ERR] {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {sortedCards.map((card) => {
            const isSelected = selectedCards.some(c => c.displayId === card.displayId);
            const canSelect = isSelected || selectedCards.length < 8;

            return (
              <div 
                key={card.displayId} 
                onClick={() => toggleCardSelection(card)}
                className={`bg-[#181822] rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? 'opacity-100 grayscale-0 border-2 border-champagne shadow-glow-champagne scale-105 cursor-pointer z-10' 
                    : `opacity-40 grayscale border border-slate-700/50 ${canSelect ? 'hover:opacity-60 cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`
                }`}
              >
                <div className="relative w-full aspect-[3/4] select-none">
                  <img
                    src={card.displayIcon}
                    alt={card.name}
                    className="absolute inset-0 w-full h-full object-contain"
                    loading="lazy"
                    draggable="false"
                  />
                </div>
                <div className="w-full text-center mt-2 flex-grow flex items-center justify-center">
                  <span className={`font-mono text-[9px] uppercase tracking-widest block truncate px-1 ${isSelected ? 'text-champagne font-bold' : 'text-slate-400'}`}>
                    {card.name}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedCards.length > 0 && (
        <div className="flex justify-center mt-8 mb-4">
          <button 
            onClick={handleSearch}
            disabled={searching}
            className={`px-8 py-4 rounded-xl font-mono text-lg font-bold uppercase transition-all duration-300 flex items-center gap-3 bg-champagne text-obsidian shadow-glow-champagne hover:scale-105 ${searching ? 'opacity-50 cursor-wait' : ''}`}
          >
            {searching ? 'SEARCHING DATABASE...' : `SEARCH DECKS (${selectedCards.length}/8)`}
          </button>
        </div>
      )}

      {!searching && searchError && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 text-red-400 font-mono text-center shadow-skeuo-inset mt-4">
          [SEARCH ERR] {searchError}
        </div>
      )}

      {/* Found Decks Section */}
      {foundDecks.length > 0 && (
        <div className="mt-8 mb-12">
          <h2 className="font-sans font-bold text-2xl text-ivory mb-6 pl-4 border-l-4 border-champagne">
            FOUND DECKS ({foundDecks.length})
          </h2>
          <div className="flex flex-col gap-6">
            {foundDecks.map((deckObj, idx) => (
              <div key={idx} className="bg-obsidian rounded-2xl border border-champagne/30 p-6 shadow-[0_0_15px_rgba(201,168,76,0.1)]">
                <div className="flex justify-between items-center mb-6 border-b border-champagne/20 pb-4">
                  <h3 className="font-mono text-xl text-champagne font-bold">{deckObj.player_name || 'Unknown'}</h3>
                  <span className="bg-champagne/20 text-champagne px-4 py-2 rounded-full font-mono text-sm border border-champagne/50 shadow-glow-champagne">
                    Rank: #{deckObj.position}
                  </span>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {deckObj.deck.map((dc, i) => {
                    const iconUrl = dc.evolutionLevel === 1 
                      ? dc.iconUrls?.evolutionMedium || dc.iconUrls?.medium
                      : dc.evolutionLevel === 2 
                        ? dc.iconUrls?.heroMedium || dc.iconUrls?.medium
                        : dc.iconUrls?.medium;

                    return (
                      <div key={i} className="bg-[#181822] rounded-xl p-2 border border-slate-700/50 shadow-skeuo-outset">
                         <img 
                           src={iconUrl} 
                           alt={dc.name} 
                           className="w-full object-contain aspect-[3/4] filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                         />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeckFinder
