export default function SectorTable({ sectors = {}, highlights = [] }) {
  const hiMap = Object.fromEntries(highlights.map((h) => [h.sector, h]));
  const names = Object.keys(sectors).sort();

  if (names.length === 0) {
    return (
      <p style={{ color: "var(--muted)" }}>
        Sem sectores com detecções no período selecionado.
      </p>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Sector</th>
          <th>Total</th>
          <th>MODIS</th>
          <th>VIIRS</th>
          <th>Dias com detecção</th>
          <th>Última data</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {names.map((name) => {
          const s = sectors[name];
          const hi = hiMap[name];
          return (
            <tr key={name}>
              <td><strong>{name}</strong></td>
              <td>{s.total}</td>
              <td>{s.modis}</td>
              <td>{s.viirs}</td>
              <td>{s.detection_days}</td>
              <td>{s.last_date || "—"}</td>
              <td>
                {hi ? (
                  <span className="badge hi" title={hi.reason}>
                    A verificar
                  </span>
                ) : (
                  <span style={{ color: "var(--muted)" }}>—</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}