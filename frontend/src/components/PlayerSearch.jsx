"use client"

import { useState } from "react"
import { Search, Shield, Target, Activity, Trophy, Crosshair, ChevronRight } from "lucide-react"

const API_BASE_URL = "http://localhost:5050/api"

const calculateDisplayLevel = (card) => {
  const maxLevels = { common: 16, rare: 14, epic: 11, legendary: 8, champion: 6 }
  const rarity = card.rarity?.toLowerCase()
  const currentLevel = card.level
  const maxLevel = card.maxLevel || maxLevels[rarity]
  if (!maxLevel) return currentLevel
  return 16 - (maxLevel - currentLevel)
}

const getTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  
  let date;
  if (dateStr.length === 20 && dateStr.includes('T')) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(9, 11);
    const min = dateStr.substring(11, 13);
    const sec = dateStr.substring(13, 15);
    date = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}.000Z`);
  } else {
    date = new Date(dateStr);
  }

  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds > 0 ? seconds : 0) + " seconds ago";
};

import PlayerProfile from "./PlayerProfile"

function PlayerSearch() {
  const [playerTag, setPlayerTag] = useState("")
  const [playerData, setPlayerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchPlayer = async () => {
    if (!playerTag.trim()) {
      setError("Please enter a player tag")
      return
    }

    setLoading(true)
    setError(null)
    setPlayerData(null)

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

  return (
    <div className="w-full flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Search Console */}
      <div className="bg-[#12121A] rounded-[2rem] border border-slate-light p-8 shadow-skeuo-outset">
        <h2 className="font-sans font-bold text-2xl text-ivory flex items-center gap-3 mb-6">
          <Search className="text-champagne" size={24} />
          PLAYER INQUIRY
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ENTER PLAYER TAG (e.g. #2PP)"
              value={playerTag}
              onChange={(e) => setPlayerTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchPlayer()}
              className="w-full bg-obsidian border border-slate-light/50 rounded-xl px-4 py-4 text-ivory font-mono uppercase focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 shadow-skeuo-inset placeholder-slate-600 transition-all"
            />
          </div>
          <button 
            onClick={searchPlayer} 
            disabled={loading}
            className="md:w-auto w-full bg-obsidian border border-slate-light rounded-xl px-8 py-4 font-sans font-bold text-champagne hover:text-white shadow-skeuo-button hover:shadow-skeuo-button-pressed hover:border-champagne/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
          >
            {loading ? "SEARCHING..." : "EXECUTE"}
            {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </div>

      {loading && (
        <div className="font-mono text-champagne text-glow-champagne text-center tracking-widest animate-pulse p-12">
          SCANNING SUPERCELL DATABASES...
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 text-red-400 font-mono text-center shadow-skeuo-inset">
          [ERR] {error}
        </div>
      )}

      {playerData && (
        <PlayerProfile playerData={playerData} />
      )}
    </div>
  )
}

export default PlayerSearch
