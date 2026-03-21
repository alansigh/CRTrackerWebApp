"use client"

import { useState } from "react"
import WebGLBackground from "./components/WebGLBackground"
import LandingPage from "./components/LandingPage"
import PlayerSearch from "./components/PlayerSearch"
import ClanSearch from "./components/ClanSearch"
import CardList from "./components/CardList"
import Leaderboard from "./components/Leaderboard"
import DeckFinder from "./components/DeckFinder"

function App() {
  const [showApp, setShowApp] = useState(false);
  const [activeTab, setActiveTab] = useState("players");

  const launchApp = () => {
    setShowApp(true);
    // Smooth scroll to top when launching app
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnToLanding = () => {
    setShowApp(false);
  };

  return (
    <>
      {/* Global Cinematic Overlays */}
      <WebGLBackground />
      <div className="noise-overlay" />
      <div className="crt-scanlines" />

      {!showApp ? (
        <LandingPage onLaunchApp={launchApp} />
      ) : (
        <div className="relative z-10 min-h-screen text-ivory">
          
          {/* Main App Navigation Header */}
          <header className="sticky top-0 z-40 bg-obsidian/80 backdrop-blur-xl border-b border-champagne/20 px-6 py-4 shadow-skeuo-outset">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div 
                className="cursor-pointer flex items-center gap-3 font-sans font-bold text-xl tracking-tight text-ivory hover:text-champagne transition-colors"
                onClick={returnToLanding}
              >
                <div className="w-3 h-3 rounded-full bg-champagne text-glow-champagne" />
                CRTRACKER // TERMINAL
              </div>

              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-2 p-1 bg-obsidian rounded-xl shadow-skeuo-inset border border-slate-light/30">
                  {['players', 'clans', 'cards', 'leaderboard'].map((tab) => {
                    let activeClass = 'bg-champagne text-obsidian shadow-glow-champagne';
                    let inactiveClass = 'text-slate-400 hover:text-ivory hover:bg-slate-light/20';

                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg font-mono text-sm capitalize transition-all duration-300 ${
                          activeTab === tab ? activeClass : inactiveClass
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  })}
                </nav>
                
                <button
                  onClick={() => setActiveTab('deck finder')}
                  className={`px-8 py-3 rounded-xl font-mono text-base font-bold uppercase transition-all duration-300 flex items-center gap-2 bg-ivory text-champagne shadow-[0_0_15px_rgba(255,255,240,0.3)] hover:shadow-glow-champagne hover:-translate-y-1 ${
                    activeTab === 'deck finder' ? 'ring-2 ring-champagne ring-offset-2 ring-offset-obsidian' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  DECK FINDER
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="bg-obsidian rounded-[2rem] border border-slate-light p-6 md:p-10 shadow-skeuo-outset min-h-[70vh]">
              {activeTab === "players" && <PlayerSearch />}
              {activeTab === "clans" && <ClanSearch />}
              {activeTab === "cards" && <CardList />}
              {activeTab === "leaderboard" && <Leaderboard />}
              {activeTab === "deck finder" && <DeckFinder />}
            </div>
          </main>
        </div>
      )}
    </>
  )
}

export default App
