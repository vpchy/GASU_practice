import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";
import Main from "./pages/Main.jsx";
import Profile from "./pages/Profile.jsx";
import About from "./pages/About.jsx";
import ArchitectsPage from "./pages/ArchitectsPage.jsx";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/main" replace />} />
          <Route path="main" element={<Main />} />
          <Route path="architects" element={<ArchitectsPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />

          <Route path="*" element={<Navigate to="/main" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;