import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Navigation from "./Navigation";
import Auth from "../pages/Auth";

function Layout() {
  const location = useLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  function openAuthModal() {
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  function logout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("user-auth-changed"));
    setIsAuthModalOpen(false);

    window.location.href = "/main";
  }

  return (
    <>
      {isAuthModalOpen && (
        <div
          className="auth-modal-overlay"
          onClick={closeAuthModal}
        >
          <div
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <Auth onClose={closeAuthModal} />
          </div>
        </div>
      )}

      <Header
        onOpenAuthModal={openAuthModal}
        onLogout={logout}
      />

      <main className="main-content">
        <aside className="sidebar">
        <Navigation onOpenAuthModal={openAuthModal} />  
        </aside>

        <Outlet />
      </main>
    </>
  );
}

export default Layout;