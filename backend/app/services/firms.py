import httpx
import csv
import io
from app.config import settings
from app.schemas import FireDetection
from app.services.sectors import sector_for_point

FIRMS_BASE = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

def _parse_row(row: dict, source_label: str) -> FireDetection:
    lat = float(row.get("latitude", 0))
    lon = float(row.get("longitude", 0))
    brightness = None
    for key in ("brightness", "bright_ti4", "bright_ti5"):
        if row.get(key):
            try:
                brightness = float(row[key]); break
            except ValueError:
                pass
    frp = None
    if row.get("frp"):
        try: frp = float(row["frp"])
        except ValueError: pass
    return FireDetection(
        latitude=lat, longitude=lon, brightness=brightness,
        acq_date=row.get("acq_date", ""),
        acq_time=row.get("acq_time", ""),
        satellite=row.get("satellite", ""),
        instrument=row.get("instrument", ""),
        confidence=str(row.get("confidence") or ""),
        frp=frp,
        daynight=row.get("daynight", ""),
        source=source_label,
        sector=sector_for_point(lat, lon),
    )

async def fetch_detections(source: str, days: int = 3) -> list[FireDetection]:
    if not settings.nasa_firms_map_key:
        return []
    days = max(1, min(5, days))
    bbox = (settings.gorongosa_west, settings.gorongosa_south,
            settings.gorongosa_east, settings.gorongosa_north)
    area = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
    url = f"{FIRMS_BASE}/{settings.nasa_firms_map_key}/{source}/{area}/{days}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        text = resp.text
        if not text or not text.strip():
            return []
        reader = csv.DictReader(io.StringIO(text))
        label = "MODIS" if "MODIS" in source else "VIIRS"
        out = []
        for row in reader:
            try:
                out.append(_parse_row(row, label))
            except (ValueError, TypeError):
                continue
        return out