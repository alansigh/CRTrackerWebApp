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

import PlayerProfile from "./PlayerProfile"

function ClanSearch() {
  const [clanTag, setClanTag] = useState("")
  const [clanData, setClanData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Player Drill-down State
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

  const backToClan = () => {
    setSelectedPlayer(null)
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
        <PlayerProfile playerData={selectedPlayer} onBack={backToClan} backLabel="CLAN ROSTER" />
      )}
    </div>
  )
}

export default ClanSearch
