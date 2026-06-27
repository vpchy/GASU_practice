import { Link, useLocation, useNavigate } from "react-router-dom";

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeClass = (path) =>
    location.pathname === path ? "nav-item active" : "nav-item";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="sidebar-nav">
      <Link to="/main" className={activeClass("/main")}>Лента</Link>
      <Link to="/main" className={activeClass("/main")}>Мой профиль</Link>
      <Link to="/main" className={activeClass("/main")}>Мои посты</Link>
      <Link to="/main" className={activeClass("/main")}>Сообщения</Link>
      <Link to="/main" className={activeClass("/main")}>Настройки</Link>
      <button type="button" className="nav-item logout-button" onClick={handleLogout}>
        Выйти
      </button>
    </nav>
  );
}

export default Navigation;
