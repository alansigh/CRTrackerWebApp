import "./Header.css"

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>Clash Royale Tracker</h1>
          <p className="header-subtitle">Track Players, Clans & Cards</p>
        </div>
        <div className="header-decoration">
          <span className="crown">👑</span>
        </div>
      </div>
    </header>
  )
}

export default Header
