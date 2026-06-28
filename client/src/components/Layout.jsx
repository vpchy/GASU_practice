import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Navigation from "./Navigation";
import Auth from "../pages/Auth";

function Layout() {
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const protectedPaths = ["/main", "/profile"];

    if (!token && protectedPaths.includes(location.pathname) && !isAuthModalOpen) {
      setIsAuthModalOpen(true);
    }
  }, [location.pathname, isAuthModalOpen]);

  function openAuthModal() {
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  return (
    <>
      {isAuthModalOpen && (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <Auth onClose={closeAuthModal} />
          </div>
        </div>
      )}

      <Header onOpenAuthModal={openAuthModal} />

      <main className="main-content">
        <aside className="sidebar">
          <Navigation />
        </aside>

        <Outlet />
      </main>
    </>
  );
}

export default Layout;
