import { useEffect, useState } from "react";
import VisitForm from "../components/VisitForm";
import VisitList from "../components/VisitList";
import { getSectors, listVisits } from "../api";

export default function VisitasPage({ onToast }) {
  const [sectors, setSectors] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [s, v] = await Promise.all([getSectors(), listVisits()]);
      setSectors(s.sectors);
      setVisits(v);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleCreated(v) {
    setVisits((old) => [v, ...old]);
    onToast && onToast(`Visita #${v.id} criada no sector ${v.sector}.`);
  }

  return (
    <div>
      <h1 className="page-title">Visitas de campo</h1>
      <p className="page-sub">
        Planeia visitas, registra observações e mantém o histórico. Observações
        simuladas ficam marcadas como tal.
      </p>

      <VisitForm sectors={sectors} onCreated={handleCreated} />

      <h3 style={{ margin: "24px 0 12px", fontSize: 15 }}>
        Visitas ({visits.length})
      </h3>

      {loading && <p style={{ color: "var(--muted)" }}>A carregar…</p>}
      <VisitList visits={visits} onRefresh={load} />
    </div>
  );
}