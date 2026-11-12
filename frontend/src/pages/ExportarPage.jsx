import { useState } from "react";
import ExportPanel from "../components/ExportPanel";

export default function ExportarPage() {
  const [days, setDays] = useState(5);
  const [source, setSource] = useState("both");

  return (
    <div>
      <h1 className="page-title">Exportar</h1>
      <p className="page-sub">
        Exportações em CSV com fonte, sensor, período e limitações explícitas.
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
      </div>

      <ExportPanel days={days} source={source} />
    </div>
  );
}