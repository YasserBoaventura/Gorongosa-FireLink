import { useEffect, useState } from "react";
import CalendarView from "../components/CalendarView";
import { getCalendar } from "../api";

export default function CalendarioPage() {
  const [data, setData] = useState({ days: [], reference: { highlights: [] } });
  const [days, setDays] = useState(5);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const c = await getCalendar(days);
      setData(c);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [days]);

  return (
    <div>
      <h1 className="page-title">Calendário de detecções</h1>
      <p className="page-sub">
        Dias com detecção por sensor. A intensidade da cor reflecte o número de
        detecções nesse dia.
      </p>

      <div className="controls">
        <label>
          Período:
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={3}>Últimos 3 dias</option>
            <option value={5}>Últimos 5 dias</option>
          </select>
        </label>
        <button className="btn ghost" onClick={load} disabled={loading}>
          {loading ? "A carregar…" : "Actualizar"}
        </button>
      </div>

      <div className="panel">
        <CalendarView days={data.days} />
      </div>

      {(data.reference?.highlights || []).length > 0 && (
        <div className="panel">
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Sectores em destaque</h3>
          {data.reference.highlights.map((h) => (
            <div key={h.sector} className="highlight-card">
              <div>
                <strong>{h.sector}</strong>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {h.reason} · última detecção: {h.last_date || "—"}
                </div>
              </div>
              <span className="badge hi">A verificar</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}