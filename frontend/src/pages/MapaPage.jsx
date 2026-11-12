import { useEffect, useState } from "react";
import FireMap from "../components/FireMap";
import { getDetections, getSectors, getHighlights } from "../api";

export default function MapaPage() {
  const [detections, setDetections] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [days, setDays] = useState(3);
  const [source, setSource] = useState("both");
  const [loading, setLoading] = useState(false);
  const [limitations, setLimitations] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [d, s, h] = await Promise.all([
        getDetections(days, source),
        getSectors(),
        getHighlights(days),
      ]);
      setDetections(d.detections);
      setLimitations(d.limitations);
      setSectors(s.sectors);
      setHighlights(h.highlights || []);
    } catch {
      setLimitations("Não foi possível obter dados do backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [days, source]);

  const modis = detections.filter((d) => d.source === "MODIS").length;
  const viirs = detections.filter((d) => d.source === "VIIRS").length;

  return (
    <div>
      <h1 className="page-title">Mapa de detecções</h1>
      <p className="page-sub">
        Focos de calor MODIS e VIIRS sobre a área da Gorongosa, com sectores de análise
        (grelha provisória a validar com o Parque).
      </p>

      <div className="controls">
        <label>
          Período:
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={1}>Último 1 dia</option>
            <option value={3}>Últimos 3 dias</option>
            <option value={5}>Últimos 5 dias</option>
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
        <button className="btn ghost" onClick={load} disabled={loading}>
          {loading ? "A carregar…" : "Actualizar"}
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
          {detections.length} detecções · <span className="badge modis">MODIS {modis}</span>{" "}
          <span className="badge viirs">VIIRS {viirs}</span>
        </span>
      </div>

      <FireMap
        detections={detections}
        sectors={sectors}
        highlights={highlights}
      />

      {limitations && (
        <div className="alert warn" style={{ marginTop: 12 }}>
          {limitations}
        </div>
      )}
    </div>
  );
}