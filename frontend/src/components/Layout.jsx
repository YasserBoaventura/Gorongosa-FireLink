export default function Layout({ user, onLogout, active, onNavigate, children }) {
  const nav = [
    { id: "dashboard", label: "📊 Painel" },
    { id: "mapa", label: "🗺️ Mapa" },
    { id: "calendario", label: "📅 Calendário" },
    { id: "sectores", label: "📍 Sectores" },
    { id: "visitas", label: "📝 Visitas" },
    { id: "exportar", label: "⬇️ Exportar" },
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="dot">🔥</span>
          FireLink
        </div>
        {nav.map((n) => (
          <button
            key={n.id}
            className={`nav ${active === n.id ? "active" : ""}`}
            onClick={() => onNavigate(n.id)}
          >
            {n.label}
          </button>
        ))}
        <div className="user">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
          <button className="logout" onClick={onLogout}>
            Terminar sessão
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}