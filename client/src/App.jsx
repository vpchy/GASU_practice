import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth.jsx";
import Main from "./pages/Main.jsx";

function App() {
  const isLoggedIn = !!localStorage.getItem("user");

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/main" replace /> : <Auth />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/main" element={<Main />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
