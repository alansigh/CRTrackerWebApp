"use client"

import { useState, useEffect } from "react"
import { Trophy, ChevronDown, ChevronUp, Terminal, Calendar } from "lucide-react"

const API_BASE_URL = "http://localhost:5050/api"

const calculateDisplayLevel = (card) => {
  const maxLevels = { common: 16, rare: 14, epic: 11, legendary: 8, champion: 6 }
  const rarity = card.rarity?.toLowerCase()
  const currentLevel = card.level
  const maxLevel = card.maxLevel || maxLevels[rarity]
  if (!maxLevel) return currentLevel
  return 16 - (maxLevel - currentLevel)
}

const generateSeasonOptions = () => {
  const options = [{ value: "current", label: "CURRENT SEASON" }]
  const currentDate = new Date()
  currentDate.setMonth(currentDate.getMonth() - 1)

  for (let i = 0; i < 24; i++) {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const value = `${year}-${month.toString().padStart(2, "0")}`
    const monthName = currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()

    options.push({ value, label: monthName })
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
    if (playerDecks[playerTag]) return

    try {
      const cleanTag = playerTag.replace("#", "")

      let response = await fetch(`${API_BASE_URL}/players/${cleanTag}/currentrankeddeck`)
      let data = await response.json()

      let deckData = null;
      let battleType = null;
      let gameMode = null;

      if (response.ok && data.success) {
        deckData = data.data;
        battleType = data.battleType;
        gameMode = data.gameMode;
      } else {
        response = await fetch(`${API_BASE_URL}/players/${cleanTag}/currentdeck`)
        data = await response.json()
        if (response.ok && data.success) {
          deckData = data.data;
          battleType = data.battleType;
          gameMode = data.gameMode;
        }
      }

      if (deckData) {
        setPlayerDecks((prev) => ({
          ...prev,
          [playerTag]: { cards: deckData, battleType, gameMode },
        }))
      } else {
        setPlayerDecks((prev) => ({
          ...prev,
          [playerTag]: { cards: [] },
        }))
      }
    } catch (err) {
      console.error(`Failed to fetch deck for ${playerTag}:`, err)
      setPlayerDecks((prev) => ({
        ...prev,
        [playerTag]: { cards: [] },
      }))
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
    <div className="w-full flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-[#12121A] rounded-[2rem] border border-slate-light p-6 md:p-8 shadow-skeuo-outset flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="font-sans font-bold text-2xl text-ivory flex items-center gap-3 mb-2">
            <Terminal className="text-champagne" size={24} />
            GLOBAL STANDINGS
          </h2>
          <span className="font-mono text-xs text-slate-500 tracking-widest uppercase">Path of Legends / Encrypted Connection</span>
        </div>

        <div className="flex items-center gap-3 bg-obsidian border border-slate-light/50 p-2 rounded-xl shadow-skeuo-inset">
          <Calendar size={16} className="text-champagne ml-2" />
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            disabled={loading}
            className="bg-transparent border-none text-ivory font-mono text-sm uppercase focus:outline-none focus:ring-0 w-48 appearance-none select-none cursor-pointer"
          >
            {seasonOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-obsidian text-ivory">
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none mr-2 text-slate-400">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="font-mono text-champagne text-glow-champagne text-center tracking-widest animate-pulse p-12">
          ESTABLISHING SECURE LINK TO LEADERBOARD SERVER...
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 text-red-400 font-mono text-center shadow-skeuo-inset">
          [ERR] {error}
        </div>
      )}

      {!loading && !error && leaderboardData.length > 0 && (
        <div className="bg-obsidian border border-slate-light/50 rounded-2xl p-4 md:p-6 shadow-skeuo-outset relative overflow-hidden">

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-light/50 font-mono text-[10px] text-slate-500 uppercase tracking-widest px-4">
            <div className="col-span-2 md:col-span-1 text-center">RNK</div>
            <div className="col-span-6 md:col-span-5">OPERATIVE</div>
            <div className="col-span-4 md:col-span-4 text-right md:text-left text-champagne">RATING</div>
            <div className="col-span-12 md:col-span-2 hidden md:block text-right">TELEMETRY</div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col mt-2">
            {leaderboardData.map((player) => (
              <div key={player.tag} className="flex flex-col border-b border-slate-light/10 last:border-0 hover:bg-slate-light/5 transition-colors rounded-xl overflow-hidden group">

                {/* Row */}
                <div
                  className="grid grid-cols-12 gap-4 py-4 px-4 items-center cursor-pointer"
                  onClick={() => togglePlayerExpansion(player.tag)}
                >
                  <div className="col-span-2 md:col-span-1 flex justify-center">
                    <span className={`font-mono font-bold text-sm w-8 h-8 flex items-center justify-center rounded-lg shadow-skeuo-inset border ${player.rank <= 3 ? 'text-champagne border-champagne/50 glow-champagne' : 'text-slate-400 border-slate-light/30'}`}>
                      {player.rank}
                    </span>
                  </div>

                  <div className="col-span-6 md:col-span-5 flex flex-col justify-center">
                    <span className="font-sans font-bold text-ivory truncate group-hover:text-champagne transition-colors">{player.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{player.tag}</span>
                  </div>

                  <div className="col-span-4 md:col-span-4 flex justify-end md:justify-start items-center">
                    <span className="font-mono font-bold text-champagne text-lg flex items-center gap-1">
                      {player.trophies?.toLocaleString()} <Trophy size={14} className="opacity-70" />
                    </span>
                  </div>

                  <div className="col-span-12 md:col-span-2 flex justify-end items-center mt-2 md:mt-0">
                    <button className="text-slate-400 hover:text-ivory font-mono text-[10px] uppercase flex items-center gap-1 transition-colors bg-black/20 px-3 py-1.5 rounded border border-slate-light/20">
                      {expandedPlayer === player.tag ? <><ChevronUp size={12} /> HIDE DECK</> : <><ChevronDown size={12} /> VIEW DECK</>}
                    </button>
                  </div>
                </div>

                {/* Expanded Deck View */}
                {expandedPlayer === player.tag && (
                  <div className="bg-[#0D0D12] border-t border-slate-light/20 p-6 grid-bg">
                    {playerDecks[player.tag] ? (
                      <div className="animate-fade-in relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                          <span className="font-mono text-[10px] text-champagne uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-champagne animate-pulse"></span>
                            ACTIVE DECK TELEMETRY
                          </span>
                          {playerDecks[player.tag].battleType && (
                            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest border border-slate-light/30 px-2 py-1 rounded bg-black/30">
                              RECORDED IN: {playerDecks[player.tag].battleType.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                          {playerDecks[player.tag].cards.map((card, idx) => (
                            <div key={idx} className="bg-obsidian border border-slate-light/30 rounded-xl p-2 shadow-skeuo-inset flex flex-col items-center group/card">
                              {card.iconUrls?.medium && (
                                <img src={card.iconUrls.medium} alt={card.name} className="w-12 h-14 object-contain filter drop-shadow-md group-hover/card:scale-110 transition-transform mb-2" />
                              )}
                              <span className="font-mono text-[9px] text-slate-400">LVL {calculateDisplayLevel(card)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 flex flex-col items-center justify-center font-mono text-slate-500 text-xs animate-pulse opacity-70">
                        DECRYPTION IN PROGRESS...
                        <div className="w-32 h-1 bg-slate-light/30 mt-2 rounded overflow-hidden">
                          <div className="w-1/2 h-full bg-champagne animate-ping"></div>
                        </div>
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
        <div className="bg-obsidian border border-slate-light/30 rounded-xl p-12 text-center font-mono text-slate-500 shadow-skeuo-inset">
          NO DATA STREAMS DETECTED FOR SPECIFIED SEASON.
        </div>
      )}
    </div>
  )
}

export default Leaderboard
