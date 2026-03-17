"use client"

import { useState } from "react"
import { Search, Shield, Target, Activity, Trophy, Crosshair, ChevronRight, Users, ChevronLeft } from "lucide-react"

const API_BASE_URL = "http://localhost:5050/api"

const calculateDisplayLevel = (card) => {
  const maxLevels = { common: 16, rare: 14, epic: 11, legendary: 8, champion: 6 }
  const rarity = card.rarity?.toLowerCase()
  const currentLevel = card.level
  const maxLevel = card.maxLevel || maxLevels[rarity]
  if (!maxLevel) return currentLevel
  return 16 - (maxLevel - currentLevel)
}

function ClanSearch() {
  const [clanTag, setClanTag] = useState("")
  const [clanData, setClanData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Player Drill-down State
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [playerView, setPlayerView] = useState("stats") // stats, deck, battlelog, badges
  const [currentDeck, setCurrentDeck] = useState(null)
  const [battleLog, setBattleLog] = useState(null)
  const [loadingView, setLoadingView] = useState(false)

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
    setPlayerView("stats")
    setCurrentDeck(null)
    setBattleLog(null)

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

  const loadViewData = async (viewType, endpoint, setter) => {
    if (!selectedPlayer) return
    setLoadingView(true)
    setPlayerView(viewType)

    try {
      const cleanTag = selectedPlayer.tag.replace("#", "")
      const response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(cleanTag)}/${endpoint}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch ${viewType}`)
      }
      setter(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingView(false)
    }
  }

  const loadDeckData = async () => {
    if (!selectedPlayer) return
    setLoadingView(true)
    setPlayerView("deck")

    try {
      const cleanTag = selectedPlayer.tag.replace("#", "")
      let response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(cleanTag)}/currentrankeddeck`)
      let data = await response.json()
      
      let deckData = null;
      let battleType = null;
      let gameMode = null;

      if (response.ok && data.success) {
        deckData = data.data;
        battleType = data.battleType;
        gameMode = data.gameMode;
      } else {
        response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(cleanTag)}/currentdeck`)
        data = await response.json()
        if (response.ok && data.success) {
          deckData = data.data;
          battleType = data.battleType;
          gameMode = data.gameMode;
        } else {
           throw new Error(data.error || "Failed to fetch deck")
        }
      }

      setCurrentDeck({ cards: deckData, battleType, gameMode })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingView(false)
    }
  }

  const backToClan = () => {
    setSelectedPlayer(null)
    setPlayerView("stats")
    setCurrentDeck(null)
    setBattleLog(null)
  }

  return (
    <div className="w-full flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Search Console */}
      <div className="bg-[#12121A] rounded-[2rem] border border-slate-light p-8 shadow-skeuo-outset">
        <h2 className="font-sans font-bold text-2xl text-ivory flex items-center gap-3 mb-6">
          <Target className="text-champagne" size={24} />
          CLAN INQUIRY
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ENTER CLAN TAG (e.g. #2PP)"
              value={clanTag}
              onChange={(e) => setClanTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchClan()}
              className="w-full bg-obsidian border border-slate-light/50 rounded-xl px-4 py-4 text-ivory font-mono uppercase focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 shadow-skeuo-inset placeholder-slate-600 transition-all"
            />
          </div>
          <button 
            onClick={searchClan} 
            disabled={loading}
            className="md:w-auto w-full bg-obsidian border border-slate-light rounded-xl px-8 py-4 font-sans font-bold text-champagne hover:text-white shadow-skeuo-button hover:shadow-skeuo-button-pressed hover:border-champagne/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
          >
            {loading && !selectedPlayer ? "SEARCHING..." : "EXECUTE"}
            {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </div>

      {loading && !selectedPlayer && (
        <div className="font-mono text-champagne text-glow-champagne text-center tracking-widest animate-pulse p-12">
          SCANNING CLAN REGISTRY...
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 text-red-400 font-mono text-center shadow-skeuo-inset">
          [ERR] {error}
        </div>
      )}

      {/* RENDER CLAN DATA */}
      {clanData && !selectedPlayer && (
        <div className="bg-[#12121A] rounded-[2rem] border border-slate-light p-6 md:p-10 shadow-skeuo-outset flex flex-col gap-8 animate-fade-in">
          
          <div className="flex flex-col border-b border-slate-light/50 pb-8 gap-4">
            <div>
              <span className="font-mono text-champagne text-glow-champagne text-sm tracking-widest block mb-2">{clanData.tag}</span>
              <h3 className="font-sans font-bold text-4xl md:text-5xl text-ivory mb-4">{clanData.name}</h3>
              {clanData.description && (
                <p className="font-mono text-sm text-slate-400 max-w-2xl leading-relaxed border-l-2 border-slate-700 pl-4">{clanData.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { label: "Clan Score", val: clanData.clanScore?.toLocaleString(), hl: "text-champagne text-glow-champagne" },
                { label: "Members", val: `${clanData.members}/${clanData.memberCount || 50}` },
                { label: "Req. Trophies", val: clanData.requiredTrophies?.toLocaleString() },
                { label: "Type", val: clanData.type || "N/A" }
              ].map((stat, i) => (
                <div key={i} className="bg-obsidian border border-slate-light/30 p-4 rounded-xl shadow-skeuo-inset flex flex-col justify-center">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">{stat.label}</span>
                  <span className={`font-mono text-xl md:text-2xl font-bold ${stat.hl || 'text-ivory'}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          {clanData.memberList && clanData.memberList.length > 0 && (
            <div>
              <h3 className="font-sans font-bold text-xl text-ivory flex items-center gap-2 mb-6">
                <Users className="text-champagne" size={20} /> CLAN ROSTER
              </h3>
              
              <div className="bg-obsidian rounded-xl border border-slate-light/30 shadow-skeuo-inset overflow-hidden flex flex-col">
                {/* Roster Header */}
                <div className="grid grid-cols-12 gap-2 p-4 border-b border-slate-light/50 font-mono text-[10px] text-slate-500 uppercase tracking-wider bg-[#12121A]">
                  <div className="col-span-2 md:col-span-1 text-center">RNK</div>
                  <div className="col-span-6 md:col-span-7">OPERATIVE</div>
                  <div className="col-span-4 text-right">TROPHIES</div>
                </div>
                
                {/* Roster List */}
                <div className="flex flex-col max-h-[500px] overflow-y-auto">
                  {clanData.memberList
                    .sort((a, b) => (b.trophies || 0) - (a.trophies || 0))
                    .map((member, index) => (
                      <div
                        key={member.tag}
                        onClick={() => handlePlayerClick(member.tag)}
                        className="grid grid-cols-12 gap-2 p-4 border-b border-slate-light/10 hover:bg-slate-light/20 cursor-pointer transition-colors items-center group"
                      >
                        <div className="col-span-2 md:col-span-1 text-center font-mono text-sm text-slate-400">{index + 1}</div>
                        <div className="col-span-6 md:col-span-7 flex flex-col">
                          <span className="font-sans font-bold text-ivory group-hover:text-champagne transition-colors">{member.name}</span>
                          <span className="font-mono text-[10px] text-slate-500">{member.role}</span>
                        </div>
                        <div className="col-span-4 text-right font-mono text-champagne">
                          {member.trophies?.toLocaleString()} <Trophy size={10} className="inline ml-1" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER SELECTED PLAYER DATA (Re-used from PlayerSearch logic) */}
      {selectedPlayer && (
        <div className="bg-[#12121A] rounded-[2rem] border border-slate-light p-6 md:p-10 shadow-skeuo-outset flex flex-col gap-8 animate-fade-in relative">
          
          <button 
            onClick={backToClan} 
            className="absolute top-6 right-6 md:top-10 md:right-10 bg-obsidian border border-slate-light px-4 py-2 rounded-lg font-mono text-xs text-slate-400 hover:text-champagne shadow-skeuo-button hover:shadow-skeuo-button-pressed flex items-center gap-2 transition-all"
          >
            <ChevronLeft size={14} /> CLAN ROSTER
          </button>

          {/* Player Header */}
          <div className="flex flex-col justify-start border-b border-slate-light/50 pb-8 pr-32">
            <span className="font-mono text-champagne text-glow-champagne text-sm tracking-widest block mb-2">{selectedPlayer.tag}</span>
            <h3 className="font-sans font-bold text-4xl md:text-5xl text-ivory mb-2">{selectedPlayer.name}</h3>
            <div className="flex items-center gap-4 font-mono text-sm text-slate-400">
              <span className="flex items-center gap-1"><Shield size={14} className="text-champagne"/> LVL {selectedPlayer.expLevel}</span>
            </div>
          </div>

          {/* Sub-navigation */}
          <div className="flex flex-wrap gap-2 p-1 bg-obsidian rounded-xl shadow-skeuo-inset border border-slate-light/30">
            {[
              { id: 'stats', label: 'Telemetry', icon: Activity },
              { id: 'deck', label: 'Active Deck', icon: Crosshair, onClick: loadDeckData },
              { id: 'battlelog', label: 'Combat Log', icon: Target, onClick: () => loadViewData("battlelog", "battlelog", setBattleLog) },
              { id: 'badges', label: 'Merits', icon: Trophy }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={tab.onClick || (() => setPlayerView(tab.id))}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-xs tracking-wider uppercase transition-all duration-300 flex-1 md:flex-none justify-center ${
                  playerView === tab.id 
                    ? 'bg-champagne text-obsidian shadow-glow-champagne font-bold' 
                    : 'text-slate-400 hover:text-ivory hover:bg-slate-light/20'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading View Data */}
          {loadingView && (
            <div className="h-64 flex items-center justify-center font-mono text-slate-500 animate-pulse">
              RETRIEVING DATA PACKETS...
            </div>
          )}

          {/* Player Views */}
          {!loadingView && (
            <div className="min-h-[300px]">
              
              {/* STATS VIEW */}
              {playerView === "stats" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Trophies", val: selectedPlayer.trophies?.toLocaleString(), hl: "text-champagne text-glow-champagne" },
                    { label: "Best Trophies", val: selectedPlayer.bestTrophies?.toLocaleString() },
                    { label: "Wins", val: selectedPlayer.wins?.toLocaleString(), hl: "text-green-400" },
                    { label: "Losses", val: selectedPlayer.losses?.toLocaleString(), hl: "text-red-400" },
                    { label: "3-Crowns", val: selectedPlayer.threeCrownWins?.toLocaleString() },
                    { label: "Total Combats", val: selectedPlayer.battleCount?.toLocaleString() },
                    { label: "Win Rate", val: selectedPlayer.wins && selectedPlayer.losses ? ((selectedPlayer.wins / (selectedPlayer.wins + selectedPlayer.losses)) * 100).toFixed(1) + '%' : "N/A" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-obsidian border border-slate-light/30 p-4 rounded-xl shadow-skeuo-inset flex flex-col justify-center">
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">{stat.label}</span>
                      <span className={`font-mono text-xl md:text-2xl font-bold ${stat.hl || 'text-ivory'}`}>{stat.val}</span>
                    </div>
                  ))}
                  
                  {selectedPlayer.arena && (
                    <div className="col-span-2 md:col-span-4 bg-obsidian border border-slate-light/30 p-6 rounded-xl shadow-skeuo-inset flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-champagne/30 flex items-center justify-center shadow-skeuo-inset bg-obsidian text-champagne">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Current Arena</span>
                        <span className="font-sans font-bold text-xl text-ivory">{selectedPlayer.arena.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DECK VIEW */}
              {playerView === "deck" && currentDeck && (
                <div className="flex flex-col gap-4">
                  {currentDeck.battleType && (
                    <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest border border-slate-light/30 px-3 py-2 rounded bg-black/30 inline-block self-start">
                      RECORDED IN: {currentDeck.battleType.replace(/([A-Z])/g, ' $1').trim()} {currentDeck.gameMode ? `(${currentDeck.gameMode})` : ''}
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentDeck.cards.map((card, idx) => (
                      <div key={idx} className="bg-obsidian border border-slate-light/50 p-4 rounded-xl shadow-skeuo-outset group hover:-translate-y-1 transition-transform flex flex-col items-center flex-1">
                        {card.iconUrls?.medium && (
                          <div className="relative w-24 h-28 mb-4">
                            <img src={card.iconUrls.medium} alt={card.name} className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
                          </div>
                        )}
                        <span className="font-sans font-bold text-sm text-ivory text-center mb-1">{card.name}</span>
                        <span className="font-mono text-xs text-champagne bg-champagne/10 px-2 py-1 rounded">LVL {calculateDisplayLevel(card)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BATTLELOG VIEW */}
              {playerView === "battlelog" && battleLog && (
                <div className="flex flex-col gap-3">
                  {battleLog.slice(0, 8).map((battle, index) => {
                    const isWin = battle.team && battle.opponent && battle.team[0]?.crowns > battle.opponent[0]?.crowns;
                    return (
                      <div key={index} className="bg-obsidian border border-slate-light/30 p-4 rounded-xl shadow-skeuo-inset flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-12 rounded-full ${isWin ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                          <div>
                            <span className="font-mono text-xs text-slate-400 block mb-1">{new Date(battle.battleTime).toLocaleString()}</span>
                            <span className="font-sans font-bold text-ivory uppercase">{battle.type}</span>
                          </div>
                        </div>
                        {battle.team && battle.opponent && (
                          <div className="flex items-center gap-4 font-mono text-xl">
                            <span className={isWin ? 'text-green-400' : 'text-slate-500'}>{battle.team[0]?.crowns || 0}</span>
                            <span className="text-slate-600">-</span>
                            <span className={!isWin ? 'text-red-400' : 'text-slate-500'}>{battle.opponent[0]?.crowns || 0}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BADGES VIEW */}
              {playerView === "badges" && selectedPlayer.badges && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedPlayer.badges.map((badge, idx) => (
                    <div key={idx} className="bg-obsidian border border-slate-light/30 p-6 rounded-xl shadow-skeuo-inset flex flex-col items-center justify-center text-center">
                      {badge.iconUrls?.large && (
                        <div className="relative w-16 h-16 mb-4">
                           <img src={badge.iconUrls.large} alt={badge.name} className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(201,168,76,0.3)]" />
                        </div>
                      )}
                      <span className="font-sans font-bold text-xs text-ivory mb-2 leading-tight">{badge.name}</span>
                      {badge.progress && (
                        <span className="font-mono text-[10px] text-slate-400 border border-slate-700 rounded px-2 py-1 bg-black/50">
                          {badge.progress}/{badge.target || badge.maxLevel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default ClanSearch
