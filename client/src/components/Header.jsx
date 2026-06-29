import { Link } from "react-router-dom";

function Header({ onOpenAuthModal, onLogout }) {
  const isAuth = !!localStorage.getItem("token");

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
          <input
            className="search-input"
            type="text"
            placeholder="Поиск постов..."
          />
        </div>

        <div className="header-actions">
          <button className="icon-btn" type="button">
            🔔
          </button>

          {isAuth ? (
            <Link to="/profile" className="avatar-btn">
              <img
                src="/default-avatar.png"
                alt="Аватар"
                className="avatar"
              />
            </Link>
          ) : (
            <button
              type="button"
              className="header-profile"
              onClick={onOpenAuthModal}
            >
              <span className="username">
                Войти/зарегистрироваться
              </span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}

export default Header;