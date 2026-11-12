import { useEffect, useState } from "react";
import { listVisits, listObservations, createObservation } from "../api";

export default function VisitList({ visits, onRefresh }) {
  const [openId, setOpenId] = useState(null);
  const [obsByVisit, setObsByVisit] = useState({});
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  async function loadObs(visitId) {
    if (obsByVisit[visitId]) return;
    try {
      const obs = await listObservations(visitId);
      setObsByVisit((m) => ({ ...m, [visitId]: obs }));
    } catch {
      setObsByVisit((m) => ({ ...m, [visitId]: [] }));
    }
  }

  function open(visit) {
    const id = openId === visit.id ? null : visit.id;
    setOpenId(id);
    if (id) loadObs(id);
  }

  function startObs(visit) {
    setForm({
      visit_id: visit.id,
      result: "presenca",
      observed_date: new Date().toISOString().slice(0, 10),
      notes: "",
      latitude: "",
      longitude: "",
      simulated: true,
    });
  }

  async function saveObs(e) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    try {
      const payload = {
        ...form,
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
      };
      const created = await createObservation(payload);
      setObsByVisit((m) => ({
        ...m,
        [form.visit_id]: [...(m[form.visit_id] || []), created],
      }));
      setForm(null);
      onRefresh && onRefresh();
    } catch {
      alert("Falha ao gravar observação.");
    } finally {
      setBusy(false);
    }
  }

  if (visits.length === 0) {
    return (
      <p style={{ color: "var(--muted)" }}>
        Ainda não há visitas. Cria uma acima.
      </p>
    );
  }

  return (
    <div>
      {visits.map((v) => (
        <div key={v.id} className="panel" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <strong>
                #{v.id} · {v.sector}
              </strong>{" "}
              <span className={`badge ${v.status}`}>{v.status}</span>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                {v.period_start} → {v.period_end} · prevista: {v.planned_date || "—"}
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{v.objective}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn ghost" onClick={() => open(v)}>
                {openId === v.id ? "Fechar" : "Observações"}
              </button>
              <button className="btn" onClick={() => startObs(v)}>
                + Observação
              </button>
            </div>
          </div>

          {openId === v.id && (
            <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              {(obsByVisit[v.id] || []).length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: 12 }}>
                  Sem observações registadas.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Resultado</th>
                      <th>Data</th>
                      <th>Notas</th>
                      <th>Coord.</th>
                      <th>Simulada?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obsByVisit[v.id].map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.result}</td>
                        <td>{o.observed_date || "—"}</td>
                        <td style={{ maxWidth: 280, whiteSpace: "normal" }}>{o.notes || "—"}</td>
                        <td>
                          {o.latitude != null
                            ? `${o.latitude.toFixed(4)}, ${o.longitude.toFixed(4)}`
                            : "—"}
                        </td>
                        <td>{o.simulated ? "Sim" : "Não"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {form && form.visit_id === v.id && (
            <form onSubmit={saveObs} style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 13 }}>Registar observação (visita #{v.id})</h4>
              <div className="form-grid">
                <label>
                  Resultado
                  <select
                    value={form.result}
                    onChange={(e) => setForm({ ...form, result: e.target.value })}
                  >
                    <option value="presenca">Presença</option>
                    <option value="ausencia">Ausência</option>
                    <option value="inconclusivo">Inconclusivo</option>
                  </select>
                </label>
                <label>
                  Data observada
                  <input
                    type="date"
                    value={form.observed_date}
                    onChange={(e) => setForm({ ...form, observed_date: e.target.value })}
                  />
                </label>
                <label>
                  Latitude
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  />
                </label>
                <label>
                  Longitude
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  />
                </label>
                <label style={{ gridColumn: "1 / -1" }}>
                  Notas
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </label>
                <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.simulated}
                    onChange={(e) => setForm({ ...form, simulated: e.target.checked })}
                  />
                  Observação simulada (demonstração)
                </label>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button className="btn" type="submit" disabled={busy}>
                  {busy ? "A gravar…" : "Gravar observação"}
                </button>
                <button className="btn ghost" type="button" onClick={() => setForm(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}