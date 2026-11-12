import { exportDetectionsUrl, exportSummaryUrl } from "../api";

export default function ExportPanel({ days, source }) {
  return (
    <div className="panel">
      <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>Exportar dados</h3>
      <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 16px" }}>
        Cada exportação inclui a fonte (NASA FIRMS), o sensor, o período e as
        limitações de interpretação.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <strong>Detecções (CSV)</strong>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Últimos {days} dias · fonte: {source}
            </div>
          </div>
          <a className="btn" href={exportDetectionsUrl(days, source)} target="_blank" rel="noreferrer">
            Descarregar
          </a>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <strong>Resumo de visitas e observações (CSV)</strong>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Inclui estado, resultado e coordenadas de cada observação.
            </div>
          </div>
          <a className="btn ghost" href={exportSummaryUrl()} target="_blank" rel="noreferrer">
            Descarregar
          </a>
        </div>
      </div>
    </div>
  );
}