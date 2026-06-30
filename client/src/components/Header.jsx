import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getMe } from "../api/profile";

function Header({ onOpenAuthModal, onLogout }) {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await getMe();
        if (res.success) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    }

    if (isAuth) {
      loadUser();
    } else {
      setUser(null);
    }
  }, [isAuth]);

  useEffect(() => {
    function handleAuthChange() {
      setIsAuth(!!localStorage.getItem("token"));
    }

    window.addEventListener("user-auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("user-auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
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
                src={user?.avatar || "/default-avatar.png"}
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