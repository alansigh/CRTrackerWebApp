"use client"

import { useState } from "react"
import "./App.css"
import PlayerSearch from "./components/PlayerSearch"
import ClanSearch from "./components/ClanSearch"
import CardList from "./components/CardList"
import Leaderboard from "./components/Leaderboard"
import Header from "./components/Header"

function App() {
  const [activeTab, setActiveTab] = useState("players")

  return (
    <div className="app">
      <Header />

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "players" ? "active" : ""}`}
          onClick={() => setActiveTab("players")}
        >
          Players
        </button>
        <button className={`tab-button ${activeTab === "clans" ? "active" : ""}`} onClick={() => setActiveTab("clans")}>
          Clans
        </button>
        <button className={`tab-button ${activeTab === "cards" ? "active" : ""}`} onClick={() => setActiveTab("cards")}>
          Cards
        </button>
        <button
          className={`tab-button ${activeTab === "leaderboard" ? "active" : ""}`}
          onClick={() => setActiveTab("leaderboard")}
        >
          Leaderboard
        </button>
      </nav>

      <main className="main-content">
        {activeTab === "players" && <PlayerSearch />}
        {activeTab === "clans" && <ClanSearch />}
        {activeTab === "cards" && <CardList />}
        {activeTab === "leaderboard" && <Leaderboard />}
      </main>

      <footer className="app-footer">
        <p>Powered by Clash Royale API | Built with React & Flask</p>
      </footer>
    </div>
  )
}

export default App
