import { useEffect, useMemo, useState } from "react";
import FireMap from "../components/FireMap";
import { getDetections, getSectors, getHighlights } from "../api";
import axios from "axios";

const ALERTS_URL = "http://localhost:8000/api/v1/alerts";

export default function MapaPage() {
  const [detections, setDetections] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertRules, setAlertRules] = useState(null);
  const [limitations, setLimitations] = useState("");
  const [loading, setLoading] = useState(false);

  // filtros
  const [days, setDays] = useState(3);
  const [source, setSource] = useState("both");
  const [confidenceMin, setConfidenceMin] = useState(0);
  const [sectorFilter, setSectorFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");

  async function load() {
    setLoading(true);
    try {
      const [d, s, h, a] = await Promise.all([
        getDetections(days, source),
        getSectors(),
        getHighlights(days),
        axios.get(ALERTS_URL, { params: { days } }).then((r) => r.data).catch(() => ({ alerts: [], rules: null })),
      ]);
      setDetections(d.detections);
      setLimitations(d.limitations);
      setSectors(s.sectors);
      setHighlights(h.highlights || []);
      setAlerts(a.alerts || []);
      setAlertRules(a.rules || null);
    } catch {
      setLimitations("Não foi possível obter dados do backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [days, source]);

  // filtros aplicados no cliente
  const filtered = useMemo(() => {
    let out = detections.slice();
    if (source !== "both") out = out.filter((d) => d.source === source.toUpperCase());
    if (confidenceMin > 0) {
      out = out.filter((d) => {
        const c = parseInt(d.confidence, 10);
        return !isNaN(c) && c >= confidenceMin;
      });
    }
    if (sectorFilter) out = out.filter((d) => d.sector === sectorFilter);

    out.sort((a, b) => {
      if (sortBy === "date") {
        const ka = `${a.acq_date} ${a.acq_time || ""}`;
        const kb = `${b.acq_date} ${b.acq_time || ""}`;
        return kb.localeCompare(ka);
      }
      if (sortBy === "confidence") {
        const ca = parseInt(a.confidence, 10) || 0;
        const cb = parseInt(b.confidence, 10) || 0;
        return cb - ca;
      }
      if (sortBy === "frp") {
        return (b.frp || 0) - (a.frp || 0);
      }
      return 0;
    });
    return out;
  }, [detections, source, confidenceMin, sectorFilter, sortBy]);

  const modis = filtered.filter((d) => d.source === "MODIS").length;
  const viirs = filtered.filter((d) => d.source === "VIIRS").length;

  return (
    <div>
      <h1 className="page-title">Detecções de focos de calor</h1>
      <p className="page-sub">
        MODIS e VIIRS sobre a Gorongosa. Filtra, ordena e vê os sectores que
        merecem verificação por frequência de deteção.
      </p>

      {/* ---------- Alertas ---------- */}
      {alerts.length > 0 && (
        <div className="panel" style={{ borderLeft: "3px solid #eab308" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>⚠️ Sectores com mais frequência</h3>
            {alertRules && (
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Regra: ≥{alertRules.min_days} dias ou ≥{alertRules.min_total} deteções
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 12 }}>
            {alerts.slice(0, 6).map((a) => {
              const color = a.level === "alto" ? "#ef4444" : a.level === "medio" ? "#f97316" : "#eab308";
              return (
                <div
                  key={a.sector}
                  onClick={() => setSectorFilter(a.sector)}
                  style={{
                    background: "var(--bg)",
                    border: `1px solid ${color}`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 8,
                    padding: 10,
                    cursor: "pointer",
                  }}
                  title={a.reason}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color }}>{a.sector}</strong>
                    <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>
                      {a.level}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {a.total} deteções · {a.detection_days} dias
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    MODIS {a.modis} · VIIRS {a.viirs} · última {a.last_date || "—"}
                  </div>
                  <div style={{ fontSize: 11, color, marginTop: 4 }}>{a.reason}</div>
                </div>
              );
            })}
          </div>
          {alertRules && (
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "12px 0 0" }}>
              {alertRules.description}
            </p>
          )}
        </div>
      )}

      {/* ---------- Filtros ---------- */}
      <div className="controls" style={{ gap: 10, flexWrap: "wrap" }}>
        <label>
          Período:
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={1}>1 dia</option>
            <option value={3}>3 dias</option>
            <option value={5}>5 dias</option>
          </select>
        </label>
        <label>
          Sensor:
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="both">Todos</option>
            <option value="modis">MODIS</option>
            <option value="viirs">VIIRS</option>
          </select>
        </label>
        <label>
          Confiança ≥:
          <select value={confidenceMin} onChange={(e) => setConfidenceMin(Number(e.target.value))}>
            <option value={0}>Todas</option>
            <option value={50}>50</option>
            <option value={70}>70</option>
            <option value={80}>80</option>
            <option value={90}>90</option>
          </select>
        </label>
        <label>
          Sector:
          <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
            <option value="">Todos</option>
            {alerts.map((a) => (
              <option key={a.sector} value={a.sector}>{a.sector}</option>
            ))}
          </select>
        </label>
        <label>
          Ordenar:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Data (mais recente)</option>
            <option value="confidence">Confiança</option>
            <option value="frp">FRP (intensidade)</option>
          </select>
        </label>
        <button className="btn ghost" onClick={load} disabled={loading}>
          {loading ? "A carregar…" : "Actualizar"}
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
          {filtered.length} deteções · <span className="badge modis">MODIS {modis}</span>{" "}
          <span className="badge viirs">VIIRS {viirs}</span>
        </span>
      </div>

      {/* ---------- Mapa ---------- */}
      <FireMap
        detections={filtered}
        sectors={sectors}
        highlights={alerts.map((a) => ({ sector: a.sector }))}
        onSectorClick={(name) => setSectorFilter(name)}
      />

      {/* ---------- Tabela ---------- */}
      <div className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Lista de deteções</h3>
        {filtered.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Sem deteções com os filtros atuais.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Satélite</th>
                <th>Sector</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Confiança</th>
                <th>FRP</th>
                <th>Brilho</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={i}>
                  <td>
                    <span className={`badge ${d.source === "MODIS" ? "modis" : "viirs"}`}>
                      {d.source}
                    </span>
                  </td>
                  <td>{d.satellite}</td>
                  <td>{d.sector || "—"}</td>
                  <td>{d.acq_date}</td>
                  <td>{d.acq_time || "—"}</td>
                  <td>{d.confidence || "—"}</td>
                  <td>{d.frp != null ? `${d.frp.toFixed(2)} MW` : "—"}</td>
                  <td>{d.brightness != null ? `${d.brightness.toFixed(1)} K` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {limitations && (
        <div className="alert warn" style={{ marginTop: 12 }}>
          {limitations}
        </div>
      )}
    </div>
  );
}