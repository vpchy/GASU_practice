import { Link, useLocation, useNavigate } from "react-router-dom";

function Navigation() {

    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { label: "Лента", path: "/main", highlight: true },
        { label: "Мой профиль", path: "/profile", highlight: true },
        { label: "Мои посты", path: "/main", highlight: false },
        { label: "Сообщения", path: "/main", highlight: false },
        { label: "Настройки", path: "/main", highlight: false },
        { label: "Выход", action: "logout" }
    ];

    const normalizedPath = location.pathname === "/" ? "/main" : location.pathname;
    const activeIndex = menuItems.findIndex(
        item => item.highlight && item.path === normalizedPath
    );
    const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };


    return (
        <nav className="sidebar-nav">

            <div
                className="nav-indicator"
                style={{
                    transform: `translateY(${safeActiveIndex * 56}px)`
                }}
            />

            <div className="nav-links">

                {menuItems.map((item, index) => {

                    if (item.action === "logout") {
                        return (
                            <button
                                key={item.label}
                                className="nav-item nav-item-logout"
                                onClick={handleLogout}
                            >
                                {item.label}
                            </button>
                        );
                    }

                    const isActive = item.highlight && normalizedPath === item.path;

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`nav-item${isActive ? " active" : ""}`}
                        >
                            {item.label}
                        </Link>
                    );

                })}

            </div>

        </nav>
    );
}

export default Navigation;