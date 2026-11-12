import { MapContainer, TileLayer, CircleMarker, Popup, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const CENTER = [-18.9, 34.45];

const STYLE = {
  MODIS: { color: "#f97316", fillColor: "#fb923c", radius: 7 },
  VIIRS: { color: "#ef4444", fillColor: "#f87171", radius: 5 },
};

export default function FireMap({
  detections = [],
  sectors = [],
  highlights = [],
  onSectorClick,
}) {
  const hi = new Set(highlights.map((h) => h.sector));

  return (
    <div className="map-wrap">
      <MapContainer
        center={CENTER}
        zoom={10}
        style={{ height: "560px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {sectors.map((s) => {
          const [w, south, e, n] = s.bounds;
          const isHi = hi.has(s.name);
          return (
            <Rectangle
              key={s.name}
              bounds={[[south, w], [n, e]]}
              pathOptions={{
                color: isHi ? "#eab308" : "#475569",
                weight: isHi ? 2 : 1,
                fillOpacity: isHi ? 0.08 : 0.02,
                dashArray: isHi ? undefined : "4 4",
              }}
              eventHandlers={{
                click: () => onSectorClick && onSectorClick(s.name),
              }}
            >
              <Popup>
                <strong>{s.name}</strong>
                {isHi && (
                  <div style={{ color: "#b45309", fontSize: 12 }}>
                    A verificar
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#555" }}>
                  Clique para abrir ficha de visita
                </div>
              </Popup>
            </Rectangle>
          );
        })}

        {detections.map((d, i) => {
          const st = STYLE[d.source] || STYLE.MODIS;
          return (
            <CircleMarker
              key={i}
              center={[d.latitude, d.longitude]}
              pathOptions={{
                color: st.color,
                fillColor: st.fillColor,
                fillOpacity: 0.85,
                weight: 1,
              }}
              radius={st.radius}
            >
              <Popup>
                <strong>{d.source}</strong> · {d.satellite}
                <br />
                Data: {d.acq_date} {d.acq_time}
                <br />
                Sector: {d.sector || "—"}
                <br />
                Brilho: {d.brightness ?? "—"} K
                <br />
                Confiança: {d.confidence || "—"}
                <br />
                FRP: {d.frp ?? "—"} MW
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}