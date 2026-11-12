import { useEffect, useState } from "react";
import { getDetections, getHighlights, listVisits } from "../api";

export default function Dashboard() {
  const [data, setData] = useState({
    total: 0,
    modis: 0,
    viirs: 0,
    highlights: 0,
    visits: 0,
    realizadas: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const [d, h, v] = await Promise.all([
          getDetections(5, "both"),
          getHighlights(5),
          listVisits(),
        ]);
        const det = d.detections || [];
        setData({
          total: det.length,
          modis: det.filter((x) => x.source === "MODIS").length,
          viirs: det.filter((x) => x.source === "VIIRS").length,
          highlights: (h.highlights || []).length,
          visits: v.length,
          realizadas: v.filter((x) => x.status === "realizada").length,
        });
      } catch {
        /* noop */
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="page-title">Painel</h1>
      <p className="page-sub">
        Resumo dos últimos 5 dias. Dados da NASA FIRMS, actualizados a cada consulta.
      </p>

      <div className="stats">
        <div className="stat">
          <div className="label">Detecções (5 dias)</div>
          <div className="value">{data.total}</div>
          <div className="delta">MODIS {data.modis} · VIIRS {data.viirs}</div>
        </div>
        <div className={`stat ${data.highlights ? "warn" : ""}`}>
          <div className="label">Sectores a verificar</div>
          <div className="value">{data.highlights}</div>
          <div className="delta">Com ≥2 dias de detecção</div>
        </div>
        <div className="stat">
          <div className="label">Visitas de campo</div>
          <div className="value">{data.visits}</div>
          <div className="delta">{data.realizadas} realizadas</div>
        </div>
        <div className="stat">
          <div className="label">Fonte</div>
          <div className="value" style={{ fontSize: 16 }}>NASA FIRMS</div>
          <div className="delta">MODIS + VIIRS NRT</div>
        </div>
      </div>

      <div className="alert info">
        Uma detecção FIRMS é um foco de calor/anomalia térmica. Não confirma
        incêndio, não mede área ardida e a ausência de detecção não prova ausência
        de fogo.
      </div>
    </div>
  );
}