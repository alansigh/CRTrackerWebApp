"use client"

import { useState, useEffect } from "react"
import { Archive, Filter, ArrowUpDown, Zap, X, Loader2 } from "lucide-react"

const API_BASE_URL = "http://localhost:5050/api"

function CardList() {
  const [cards, setCards] = useState([])
  const [evolutionCards, setEvolutionCards] = useState([])
  const [heroCards, setHeroCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [elixirSort, setElixirSort] = useState("none")
  
  const [selectedCard, setSelectedCard] = useState(null)
  const [cardStats, setCardStats] = useState([])
  const [cardStatsLoading, setCardStatsLoading] = useState(false)
  const [cardStatsError, setCardStatsError] = useState(null)
  const [selectedCardMode, setSelectedCardMode] = useState(null)

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

      setCards(Array.isArray(cardsData.data?.items) ? cardsData.data.items : [])
      setEvolutionCards(Array.isArray(evosData.data?.items) ? evosData.data.items : [])
      setHeroCards(Array.isArray(heroesData.data?.items) ? heroesData.data.items : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = async (card, mode) => {
    setSelectedCard(card);
    setSelectedCardMode(mode);
    setCardStatsLoading(true);
    setCardStatsError(null);
    setCardStats([]);

    try {
      let prefix = '';
      if (mode === 'evolution') prefix = '1';
      else if (mode === 'hero') prefix = '2';
      
      const cardQuery = `${prefix}${card.name}`;
      
      const response = await fetch(`${API_BASE_URL}/decks/?cards=${encodeURIComponent(cardQuery)}`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch card statistics");
      }
      
      setCardStats(data.data || []);
    } catch (err) {
      setCardStatsError(err.message);
    } finally {
      setCardStatsLoading(false);
    }
  };

  const applyFilters = (cardList) => {
    if (!Array.isArray(cardList)) return []
    return cardList
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
  }

  const filteredCards = applyFilters(cards)
  const filteredEvos = applyFilters(evolutionCards)
  const filteredHeroes = applyFilters(heroCards)

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

  const renderCard = (card, mode = 'normal') => {
    const rarityClasses = getRarityColorClass(card.rarity);
    
    let iconUrl = card.iconUrls?.medium;
    if (mode === 'evolution' && card.iconUrls?.evolutionMedium) {
      iconUrl = card.iconUrls.evolutionMedium;
    } else if (mode === 'hero' && card.iconUrls?.heroMedium) {
      iconUrl = card.iconUrls.heroMedium;
    }

    return (
      <div 
        key={`${mode}-${card.id || card.name}`} 
        onClick={() => handleCardClick(card, mode)}
        className={`bg-[#181822] rounded-2xl border-2 p-2 flex flex-col items-center justify-between shadow-skeuo-outset group hover:-translate-y-2 hover:scale-[1.05] transition-all duration-300 cursor-pointer ${rarityClasses}`}
      >
        <div className="absolute top-2 left-2 flex items-center justify-center w-6 h-6 rounded-full bg-obsidian border border-slate-light shadow-skeuo-inset font-mono text-[10px] text-ivory">
          {card.elixirCost !== undefined ? card.elixirCost : '?'}
          <Zap size={8} className="text-purple-400 ml-[1px]" />
        </div>
        
        {iconUrl && (
          <div className="relative w-full aspect-[3/4] mt-6 mb-4 select-none">
            <img
              src={iconUrl}
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
          <div className="font-mono text-xs text-slate-500 mb-6 pl-4 border-l-2 border-champagne/30">
            INDEXING {filteredCards.length + filteredEvos.length + filteredHeroes.length} RECORDS
          </div>
          
          {filteredEvos.length > 0 && (
            <div className="mb-12">
              <h3 className="font-sans font-bold text-xl text-ivory mb-6 pl-4 border-l-4 border-champagne">EVOLUTIONS</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4">
                {filteredEvos.map((card) => renderCard(card, 'evolution'))}
              </div>
            </div>
          )}

          {filteredHeroes.length > 0 && (
            <div className="mb-12">
              <h3 className="font-sans font-bold text-xl text-ivory mb-6 pl-4 border-l-4 border-champagne">HEROES</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4">
                {filteredHeroes.map((card) => renderCard(card, 'hero'))}
              </div>
            </div>
          )}

          {filteredCards.length > 0 && (
            <div className="mb-12">
              <h3 className="font-sans font-bold text-xl text-ivory mb-6 pl-4 border-l-4 border-champagne">ALL CARDS</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4">
                {filteredCards.map((card) => renderCard(card, 'normal'))}
              </div>
            </div>
          )}
          
          {filteredCards.length === 0 && filteredEvos.length === 0 && filteredHeroes.length === 0 && (
            <div className="bg-obsidian border border-slate-light/30 rounded-xl p-12 text-center font-mono text-slate-500 shadow-skeuo-inset">
              NO RECORDS FOUND MATCHING CURRENT FILTER PARAMETERS.
            </div>
          )}
        </>
      )}

      {/* Card Stats Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#12121A] border-2 border-slate-light rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-skeuo-outset">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-obsidian">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-slate-900 border ${getRarityColorClass(selectedCard.rarity).split(' ')[1]}`}>
                  <img 
                    src={selectedCardMode === 'evolution' ? (selectedCard.iconUrls?.evolutionMedium || selectedCard.iconUrls?.medium) : 
                         selectedCardMode === 'hero' ? (selectedCard.iconUrls?.heroMedium || selectedCard.iconUrls?.medium) : 
                         selectedCard.iconUrls?.medium} 
                    alt={selectedCard.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ivory tracking-wide">{selectedCard.name}</h2>
                  <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">
                    {selectedCardMode} • {selectedCard.rarity}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCard(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {cardStatsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-champagne">
                  <Loader2 size={48} className="animate-spin mb-4" />
                  <p className="font-mono tracking-widest animate-pulse text-sm">ANALYZING TOP 1000 DECKS...</p>
                </div>
              ) : cardStatsError ? (
                <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-6 text-red-400 font-mono text-center shadow-skeuo-inset">
                  [ERR] {cardStatsError}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Stats Section */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="bg-obsidian border border-slate-light/30 rounded-2xl p-6 flex-1 shadow-skeuo-inset flex flex-col items-center justify-center">
                      <p className="text-slate-400 font-mono text-xs tracking-widest uppercase mb-2">Usage Rate (Top 1000 PoL)</p>
                      <p className="text-5xl font-bold text-champagne drop-shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                        {((cardStats.length / 1000) * 100).toFixed(1)}%
                      </p>
                      <p className="text-slate-500 text-sm mt-2 font-mono">({cardStats.length} decks found)</p>
                    </div>
                  </div>
                  
                  {/* Decks Grid */}
                  <div>
                    <h3 className="font-sans font-bold text-xl text-ivory mb-6 pl-4 border-l-4 border-champagne">CURRENT AVAILABLE DECKS</h3>
                    {cardStats.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cardStats.slice(0, 50).map((deckItem, idx) => (
                          <div key={idx} className="bg-obsidian border border-slate-light/20 rounded-xl p-4 shadow-skeuo-outset">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-ivory font-bold text-sm truncate">{deckItem.player_name || 'Unknown'}</span>
                              <span className="text-slate-500 font-mono text-xs">Rank #{deckItem.position || '?'}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {deckItem.deck.map((dc, i) => {
                                const iconUrl = dc.evolutionLevel === 1 
                                  ? dc.iconUrls?.evolutionMedium || dc.iconUrls?.medium
                                  : dc.evolutionLevel === 2 
                                    ? dc.iconUrls?.heroMedium || dc.iconUrls?.medium
                                    : dc.iconUrls?.medium;

                                return (
                                  <div key={i} className="relative aspect-[3/4] bg-slate-900 rounded-lg p-1 border border-slate-800 shadow-skeuo-inset">
                                    <img 
                                      src={iconUrl} 
                                      alt={dc.name}
                                      title={dc.name}
                                      className="w-full h-full object-contain filter drop-shadow-md"
                                    />
                                    {dc.evolutionLevel === 1 && (
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-slate-900 drop-shadow shadow-skeuo-outset"></div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-obsidian border border-slate-light/20 rounded-xl p-8 text-center text-slate-500 font-mono">
                        No decks found in the top 1000 using this card.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardList
