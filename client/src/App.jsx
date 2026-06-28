import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Auth from "./pages/Auth.jsx";
import Main from "./pages/Main.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/main" replace />} />
        <Route path="main" element={<Main />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}

export default App;

