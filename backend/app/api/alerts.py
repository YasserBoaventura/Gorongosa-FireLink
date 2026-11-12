from fastapi import APIRouter, Query
from app.services.firms import fetch_detections
from app.services.analysis import sector_summary

router = APIRouter()

@router.get("/alerts")
async def get_alerts(
    days: int = Query(5, ge=1, le=5),
    min_days: int = Query(2, ge=1, le=5),
    min_total: int = Query(2, ge=1),
):
    det = []
    det.extend(await fetch_detections("MODIS_NRT", days))
    det.extend(await fetch_detections("VIIRS_SNPP_NRT", days))
    summary = sector_summary(det)

    alerts = []
    for sector, info in summary.items():
        reasons = []
        if info["detection_days"] >= min_days:
            reasons.append(f"{info['detection_days']} dias com deteção")
        if info["total"] >= min_total:
            reasons.append(f"{info['total']} deteções no período")

        if not reasons:
            continue

        # nível de alerta — quanto mais dias/mais deteções, mais alto
        score = info["detection_days"] * 10 + info["total"]
        if score >= 40:
            level = "alto"
        elif score >= 20:
            level = "medio"
        else:
            level = "baixo"

        alerts.append({
            "sector": sector,
            "total": info["total"],
            "modis": info["modis"],
            "viirs": info["viirs"],
            "detection_days": info["detection_days"],
            "last_date": info["last_date"],
            "level": level,
            "reason": "; ".join(reasons),
            "score": score,
        })

    alerts.sort(key=lambda a: -a["score"])

    return {
        "alerts": alerts,
        "rules": {
            "min_days": min_days,
            "min_total": min_total,
            "level_thresholds": {"alto": 40, "medio": 20},
            "description": (
                "Um sector entra em alerta se tiver pelo menos "
                f"{min_days} dias com deteção ou {min_total} deteções no período. "
                "O nível combina dias × 10 + total de deteções."
            ),
        },
        "limitations": (
            "Alertas baseados em contagem de deteções, não em área ardida "
            "nem em confirmação de incêndio. Servem para priorizar verificação "
            "de campo, não para resposta de emergência."
        ),
    }