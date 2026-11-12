"""
Sectores operacionais simplificados por grelha 3x3 dentro da bounding box
da Gorongosa. Em produção, substituir por GeoJSON oficial do Parque.
"""
from app.config import settings

GRID_SIZE = 3

def _bounds():
    return (settings.gorongosa_west, settings.gorongosa_south,
            settings.gorongosa_east, settings.gorongosa_north)

def sector_grid():
    w, s, e, n = _bounds()
    dx = (e - w) / GRID_SIZE
    dy = (n - s) / GRID_SIZE
    sectors = {}
    for i in range(GRID_SIZE):
        for j in range(GRID_SIZE):
            name = f"S{chr(65+j)}{i+1}"  # ex: SA1, SB2...
            sectors[name] = (
                w + i * dx, s + j * dy,
                w + (i + 1) * dx, s + (j + 1) * dy,
            )
    return sectors

def sector_for_point(lat: float, lon: float) -> str | None:
    for name, (w, s, e, n) in sector_grid().items():
        if w <= lon <= e and s <= lat <= n:
            return name
    return None

def sector_bounds(name: str):
    return sector_grid().get(name)