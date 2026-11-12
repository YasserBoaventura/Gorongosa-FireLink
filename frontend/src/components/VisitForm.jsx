import { useState } from "react";
import { createVisit } from "../api";

export default function VisitForm({ sectors = [], onCreated, defaultSector = "" }) {
  const today = new Date().toISOString().slice(0, 10);
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    sector: defaultSector || sectors[0]?.name || "",
    period_start: today,
    period_end: today,
    objective: "",
    planned_date: in7,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.sector || !form.objective) {
      setError("Preenche o sector e o objetivo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const visit = await createVisit(form);
      onCreated && onCreated(visit);
      setForm({
        sector: sectors[0]?.name || "",
        period_start: today,
        period_end: today,
        objective: "",
        planned_date: in7,
      });
    } catch (e) {
      setError("Falha ao criar visita. Confirma o backend.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Nova visita de campo</h3>
      <div className="form-grid">
        <label>
          Sector
          <select value={form.sector} onChange={(e) => set("sector", e.target.value)}>
            {sectors.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Período — início
          <input
            type="date"
            value={form.period_start}
            onChange={(e) => set("period_start", e.target.value)}
          />
        </label>
        <label>
          Período — fim
          <input
            type="date"
            value={form.period_end}
            onChange={(e) => set("period_end", e.target.value)}
          />
        </label>
        <label>
          Data prevista
          <input
            type="date"
            value={form.planned_date}
            onChange={(e) => set("planned_date", e.target.value)}
          />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          Objetivo
          <textarea
            value={form.objective}
            onChange={(e) => set("objective", e.target.value)}
            placeholder="Ex.: Verificar repetição de detecções MODIS no sector"
          />
        </label>
      </div>
      {error && <div className="alert error" style={{ marginTop: 12 }}>{error}</div>}
      <div style={{ marginTop: 12 }}>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "A guardar…" : "Criar visita"}
        </button>
      </div>
    </form>
  );
}