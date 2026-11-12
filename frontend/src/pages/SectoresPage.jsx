import { useEffect, useState } from "react";
import SectorTable from "../components/SectorTable";
import { getCalendar } from "../api";

export default function SectoresPage() {
  const [data, setData] = useState({ sectors: {}, reference: { highlights: [] } });
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
      <h1 className="page-title">Sectores</h1>
      <p className="page-sub">
        Agregação por sector. Sectores são células provisórias da grelha; os limites
        oficiais serão fornecidos pela Gorongosa.
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
        <SectorTable
          sectors={data.sectors}
          highlights={data.reference?.highlights || []}
        />
      </div>
    </div>
  );
}