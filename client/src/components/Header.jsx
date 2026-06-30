import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Header({ onOpenAuthModal }) {
  const isAuth = !!localStorage.getItem("token");

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/main" className="logo-link">
          <span className="logo-icon">🏛️</span>

          <div className="logo-text">
            ArchSpace
          </div>
        </Link>

        <div className="header-search">
          <input
            className="search-input"
            type="text"
            placeholder="Поиск постов..."
          />
        </div>

        <div className="header-actions">
          <div
            className="notification-wrapper"
            ref={notificationRef}
          >
            <button
              className="icon-btn"
              type="button"
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
            >
              🔔
            </button>

            <div
              className={`notifications-menu ${
                showNotifications ? "active" : ""
              }`}
            >
              <div className="notification-item">
                Васильчук прокомментировал вашу публикацию
              </div>

              <div className="notification-item">
                Анна Хуевротовна поставила лайк вашей публикации
              </div>

              <div className="notification-item">
                Букунов отказался от вашей группы нахуй
              </div>
            </div>
          </div>

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