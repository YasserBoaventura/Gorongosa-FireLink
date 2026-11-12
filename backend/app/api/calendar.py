from fastapi import APIRouter, Query
from datetime import date, timedelta
from collections import Counter
from app.services.firms import fetch_detections
from app.services.analysis import build_calendar, sector_summary, highlight_sectors
from app.schemas import CalendarResponse

router = APIRouter()


def _date_range(days: int):
    """Lista de dias ISO do período, do mais antigo para o mais recente."""
    today = date.today()
    start = today - timedelta(days=days - 1)
    return [(start + timedelta(days=i)).isoformat() for i in range(days)]


@router.get("/calendar", response_model=CalendarResponse)
async def get_calendar(days: int = Query(5, ge=1, le=5)):
    det = []
    det.extend(await fetch_detections("MODIS_NRT", days))
    det.extend(await fetch_detections("VIIRS_SNPP_NRT", days))

    by_date = {}
    for d in det:
        if not d.acq_date:
            continue
        by_date.setdefault(
            d.acq_date,
            {"count": 0, "modis": 0, "viirs": 0, "frp_sum": 0.0, "frp_n": 0},
        )
        by_date[d.acq_date]["count"] += 1
        if d.source == "MODIS":
            by_date[d.acq_date]["modis"] += 1
        else:
            by_date[d.acq_date]["viirs"] += 1
        if d.frp is not None:
            by_date[d.acq_date]["frp_sum"] += d.frp
            by_date[d.acq_date]["frp_n"] += 1

    full_days = []
    for d_iso in _date_range(days):
        info = by_date.get(d_iso, {"count": 0, "modis": 0, "viirs": 0, "frp_sum": 0.0, "frp_n": 0})
        avg_frp = round(info["frp_sum"] / info["frp_n"], 2) if info["frp_n"] else None
        full_days.append({
            "date": d_iso,
            "count": info["count"],
            "modis": info["modis"],
            "viirs": info["viirs"],
            "avg_frp": avg_frp,
        })

    total = len(det)
    total_modis = sum(1 for d in det if d.source == "MODIS")
    total_viirs = sum(1 for d in det if d.source == "VIIRS")
    pct_modis = round(total_modis / total * 100, 1) if total else 0.0
    pct_viirs = round(total_viirs / total * 100, 1) if total else 0.0

    weekday_labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    weekday_counter = Counter()
    for d in det:
        if not d.acq_date:
            continue
        try:
            wd = date.fromisoformat(d.acq_date).weekday()
        except ValueError:
            continue
        weekday_counter[wd] += 1
    weekday_summary = [
        {"weekday": weekday_labels[i], "count": weekday_counter.get(i, 0)}
        for i in range(7)
    ]
    peak_weekday = max(weekday_summary, key=lambda x: x["count"]) if total else None

    # comparação com período anterior (só o que for anterior ao início atual)
    prev_det = []
    prev_det.extend(await fetch_detections("MODIS_NRT", min(days, 5)))
    prev_det.extend(await fetch_detections("VIIRS_SNPP_NRT", min(days, 5)))
    start_current = date.fromisoformat(_date_range(days)[0])
    prev_total = sum(
        1 for d in prev_det
        if d.acq_date and date.fromisoformat(d.acq_date) < start_current
    )
    trend = {
        "current": total,
        "previous": prev_total,
        "delta": total - prev_total,
        "delta_pct": round((total - prev_total) / prev_total * 100, 1) if prev_total else None,
    }

    sectors = sector_summary(det)
    highlights = highlight_sectors(det)

    return CalendarResponse(
        days=full_days,
        sectors=sectors,
        reference={
            "highlights": [h.dict() for h in highlights],
            "period_days": days,
            "start_date": _date_range(days)[0],
            "end_date": _date_range(days)[-1],
            "totals": {
                "detections": total,
                "modis": total_modis,
                "viirs": total_viirs,
                "pct_modis": pct_modis,
                "pct_viirs": pct_viirs,
            },
            "trend": trend,
            "weekday": weekday_summary,
            "peak_weekday": peak_weekday,
        },
        limitations=(
            "Calendário baseado apenas em dias com deteção; ausência de deteção "
            "não prova ausência de fogo. Nuvens, fumo e o intervalo entre "
            "passagens do satélite podem causar omissões. Não mede área ardida."
        ),
    )


@router.get("/highlights")
async def get_highlights(days: int = Query(5, ge=1, le=5)):
    det = []
    det.extend(await fetch_detections("MODIS_NRT", days))
    det.extend(await fetch_detections("VIIRS_SNPP_NRT", days))
    return {
        "highlights": [h.dict() for h in highlight_sectors(det)],
        "sectors": sector_summary(det),
    }