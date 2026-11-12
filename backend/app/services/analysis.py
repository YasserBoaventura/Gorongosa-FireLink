"""
Funções analíticas: calendário, sectores em destaque, período de referência.
"""
from collections import defaultdict
from app.schemas import FireDetection, CalendarDay, SectorHighlight

def build_calendar(detections: list[FireDetection]) -> list[CalendarDay]:
    by_date = defaultdict(lambda: {"count": 0, "modis": 0, "viirs": 0})
    for d in detections:
        if not d.acq_date:
            continue
        by_date[d.acq_date]["count"] += 1
        if d.source == "MODIS":
            by_date[d.acq_date]["modis"] += 1
        else:
            by_date[d.acq_date]["viirs"] += 1
    return [
        CalendarDay(date=date, count=v["count"], modis=v["modis"], viirs=v["viirs"])
        for date, v in sorted(by_date.items())
    ]

def sector_summary(detections: list[FireDetection]) -> dict:
    summary = defaultdict(lambda: {"days": set(), "total": 0, "last": None,
                                   "modis": 0, "viirs": 0})
    for d in detections:
        if not d.sector:
            continue
        s = summary[d.sector]
        s["total"] += 1
        s["days"].add(d.acq_date)
        s["last"] = max(s["last"] or d.acq_date, d.acq_date)
        if d.source == "MODIS":
            s["modis"] += 1
        else:
            s["viirs"] += 1
    return {
        name: {
            "total": v["total"],
            "detection_days": len(v["days"]),
            "last_date": v["last"],
            "modis": v["modis"],
            "viirs": v["viirs"],
        } for name, v in summary.items()
    }

def highlight_sectors(detections: list[FireDetection],
                       reference: dict | None = None) -> list[SectorHighlight]:
    """Destacar sectores com repetição de dias ou aumento face à referência.
    A regra é explícita e explicada no campo 'reason'."""
    summary = sector_summary(detections)
    reference = reference or {}
    out = []
    for sector, info in summary.items():
        ref_total = reference.get(sector, {}).get("total", 0)
        reasons = []
        if info["detection_days"] >= 2:
            reasons.append(f"{info['detection_days']} dias com detecção")
        if ref_total and info["total"] > ref_total:
            reasons.append(f"aumento face ao histórico ({info['total']} vs {ref_total})")
        if not reasons:
            continue
        out.append(SectorHighlight(
            sector=sector,
            detection_days=info["detection_days"],
            total_detections=info["total"],
            last_date=info["last_date"],
            reason="; ".join(reasons),
        ))
    out.sort(key=lambda h: (-h.detection_days, -h.total_detections))
    return out