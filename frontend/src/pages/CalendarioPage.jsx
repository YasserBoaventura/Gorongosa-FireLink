import { useEffect, useState } from "react";
import CalendarView from "../components/CalendarView";
import { getCalendar } from "../api";

export default function CalendarioPage() {
  const [data, setData] = useState({
    days: [],
    reference: { highlights: [], totals: {}, trend: {}, weekday: [] },
  });
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

  const ref = data.reference || {};
  const totals = ref.totals || {};
  const trend = ref.trend || {};
  const weekday = ref.weekday || [];
  const maxWeekday = Math.max(1, ...weekday.map((w) => w.count));

  return (
    <div>
      <h1 className="page-title">Calendário de deteções</h1>
      <p className="page-sub">
        Frequência diária, distribuição por sensor e tendência face ao período
        anterior. Os dias sem deteção aparecem a zero — ausência de deteção
        não prova ausência de fogo.
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
        {ref.start_date && (
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
            {ref.start_date} → {ref.end_date}
          </span>
        )}
      </div>

      {/* ---------- Cartões de resumo ---------- */}
      <div className="stats">
        <div className="stat">
          <div className="label">Deteções totais</div>
          <div className="value">{totals.detections ?? "—"}</div>
          <div className="delta">
            <span className="badge modis">MODIS {totals.modis ?? 0}</span>{" "}
            <span className="badge viirs">VIIRS {totals.viirs ?? 0}</span>
          </div>
        </div>

        <div className="stat">
          <div className="label">Distribuição</div>
          <div className="value" style={{ fontSize: 18 }}>
            {totals.pct_modis ?? 0}% / {totals.pct_viirs ?? 0}%
          </div>
          <div className="delta">MODIS / VIIRS</div>
        </div>

        <div className={`stat ${trend.delta > 0 ? "warn" : ""}`}>
          <div className="label">Tendência vs período anterior</div>
          <div className="value" style={{ fontSize: 18 }}>
            {trend.delta == null
              ? "—"
              : `${trend.delta > 0 ? "+" : ""}${trend.delta}`}
          </div>
          <div className="delta">
            {trend.previous == null
              ? "sem dados anteriores"
              : `anterior: ${trend.previous} · ${
                  trend.delta_pct == null
                    ? "n/a"
                    : `${trend.delta_pct > 0 ? "+" : ""}${trend.delta_pct}%`
                }`}
          </div>
        </div>

        <div className="stat">
          <div className="label">Dia com mais deteções</div>
          <div className="value" style={{ fontSize: 18 }}>
            {ref.peak_weekday?.weekday ?? "—"}
          </div>
          <div className="delta">
            {ref.peak_weekday ? `${ref.peak_weekday.count} deteções` : "sem dados"}
          </div>
        </div>
      </div>

      {/* ---------- Calendário ---------- */}
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15 }}>Dias do período</h3>
          <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--muted)" }}>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(234,179,8,.4)", borderRadius: 2, marginRight: 4 }} />poucas</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(249,115,22,.6)", borderRadius: 2, marginRight: 4 }} />médias</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(239,68,68,.7)", borderRadius: 2, marginRight: 4 }} />muitas</span>
          </div>
        </div>
        <CalendarView days={data.days} />
      </div>

      {/* ---------- Distribuição por dia da semana ---------- */}
      {weekday.length > 0 && (
        <div className="panel">
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Deteções por dia da semana</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {weekday.map((w) => (
              <div key={w.weekday} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{w.weekday}</div>
                <div
                  style={{
                    height: 100,
                    background: "var(--bg)",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: 4,
                  }}
                >
                  <div
                    style={{
                      height: `${(w.count / maxWeekday) * 100}%`,
                      background: "linear-gradient(180deg, #f97316, #ea580c)",
                      borderRadius: 4,
                      minHeight: w.count ? 4 : 0,
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{w.count}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "10px 0 0" }}>
            Dias da semana com mais deteções podem indicar padrões de aquisição
            do satélite ou condições meteorológicas, não necessariamente mais fogo.
          </p>
        </div>
      )}

      {/* ---------- Sectores em destaque ---------- */}
      {(ref.highlights || []).length > 0 && (
        <div className="panel">
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Sectores a verificar</h3>
          {ref.highlights.map((h) => (
            <div key={h.sector} className="highlight-card">
              <div>
                <strong>{h.sector}</strong>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {h.reason} · última deteção: {h.last_date || "—"}
                </div>
              </div>
              <span className="badge hi">A verificar</span>
            </div>
          ))}
        </div>
      )}

      <div className="alert warn" style={{ marginTop: 12 }}>
        {data.limitations ||
          "Dados de deteção de calor (NASA FIRMS). Não confirmam incêndio, não medem área ardida e não substituem a avaliação de campo."}
      </div>
    </div>
  );
}