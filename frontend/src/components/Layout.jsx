export default function Layout({ user, onLogout, active, onNavigate, children }) {
  // const nav = [
  //   { id: "dashboard", label: "📊 Painel" },
  //   { id: "mapa", label: "🗺️ Mapa" },
  //   { id: "calendario", label: "📅 Calendário" },
  //   { id: "sectores", label: "📍 Sectores" },
  //   { id: "visitas", label: "📝 Visitas" },
  //   { id: "exportar", label: "⬇️ Exportar" },
  // ];

  const nav = [
    { id: "dashboard", label: "Painel", icon: "bi-speedometer2" },
    { id: "mapa", label: "Mapa", icon: "bi-map" },
    { id: "calendario", label: "Calendário", icon: "bi-calendar3" },
    { id: "sectores", label: "Sectores", icon: "bi-geo-alt" },
    { id: "visitas", label: "Visitas", icon: "bi-clipboard-check" },
    { id: "exportar", label: "Exportar", icon: "bi-download" },
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="dot">🔥</span>
          FireLink
        </div>
        
        {/* {nav.map((n) => (
          <button
            key={n.id}
            className={`nav ${active === n.id ? "active" : ""}`}
            onClick={() => onNavigate(n.id)}
          >
            {n.label}
          </button>
        ))} */}

        {/* Start here */}
          {nav.map((item) => (
            <button
              key={item.id}
              className={`nav-item nav ${active === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        {/* End here */}
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