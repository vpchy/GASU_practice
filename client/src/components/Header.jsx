import { Link } from "react-router-dom";

function Header({ onOpenAuthModal }) {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/main" className="logo-link">
          <span className="logo-icon">🏛️</span>
          <span className="logo-text">
            Arch<span>Space</span>
          </span>
        </Link>

        <div className="header-search">
          <input className="search-input" type="text" placeholder="Поиск постов..." />
        </div>

        <div className="header-actions">
          <button className="icon-btn" type="button">
            🔔
          </button>

          <button type="button" className="header-profile" onClick={onOpenAuthModal}>
            <span className="username">Войти/зарегистрироваться</span>
          </button>

          <button className="icon-btn" type="button">
            🚪
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
