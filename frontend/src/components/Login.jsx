import { useState } from "react";
import { login, DEMO_CREDENTIALS } from "../auth";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("tecnico");
  const [password, setPassword] = useState("gorongosa");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const user = login(username, password);
    if (!user) {
      setError("Credenciais inválidas. Vê as credenciais de demonstração abaixo.");
      return;
    }
    onLogin(user);
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>
          <span className="logo">🔥</span>
          Gorongosa FireLink
        </h1>
        <p className="sub">Monitoria de focos de calor · MODIS &amp; VIIRS</p>

        <label>Utilizador</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <label>Palavra-passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button type="submit">Entrar</button>

        {error && <div className="error">{error}</div>}

        <div className="demo">
          <strong>Credenciais de demonstração</strong> (palavra-passe:{" "}
          <code>gorongosa</code>):
          <ul style={{ margin: "8px 0 0 16px", padding: 0, color: "var(--text)" }}>
            {DEMO_CREDENTIALS.map((u) => (
              <li key={u.username}>
                <code>{u.username}</code> — {u.role}
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 10 }}>
            O login é simulado no browser (localStorage). Não há tabela de utilizadores
            no backend.
          </p>
        </div>
      </form>
    </div>
  );
}