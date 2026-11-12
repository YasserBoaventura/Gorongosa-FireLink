import { useState } from "react";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import MapaPage from "./pages/MapaPage";
import CalendarioPage from "./pages/CalendarioPage";
import SectoresPage from "./pages/SectoresPage";
import VisitasPage from "./pages/VisitasPage";
import ExportarPage from "./pages/ExportarPage";
import { currentUser, logout } from "./auth";

export default function App() {
  const [user, setUser] = useState(currentUser());
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function handleLogout() {
    logout();
    setUser(null);
    setPage("dashboard");
  }

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  return (
    <>
      <Layout
        user={user}
        onLogout={handleLogout}
        active={page}
        onNavigate={setPage}
      >
        {page === "dashboard" && <Dashboard />}
        {page === "mapa" && <MapaPage />}
        {page === "calendario" && <CalendarioPage />}
        {page === "sectores" && <SectoresPage />}
        {page === "visitas" && <VisitasPage onToast={(m) => showToast(m, "success")} />}
        {page === "exportar" && <ExportarPage />}
      </Layout>

      {toast && <div className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.msg}</div>}
    </>
  );
}