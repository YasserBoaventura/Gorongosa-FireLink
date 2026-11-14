import csv
import io
from fastapi import APIRouter, Query, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.services.firms import fetch_detections

router = APIRouter()

@router.get("/export/detections.csv")
async def export_detections(days: int = Query(5, ge=1, le=5),
                             source: str = Query("both")):
    det = []
    if source in ("modis", "both"):
        det.extend(await fetch_detections("MODIS_NRT", days))
    if source in ("viirs", "both"):
        det.extend(await fetch_detections("VIIRS_SNPP_NRT", days))
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["fonte", "sensor", "lat", "lon", "data", "hora",
                "brilho", "confianca", "frp", "sector"])
    for d in det:
        w.writerow([d.source, d.instrument, d.latitude, d.longitude,
                    d.acq_date, d.acq_time, d.brightness, d.confidence,
                    d.frp, d.sector or ""])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=detections.csv"},
    )

@router.get("/export/summary.csv")
def export_summary(db: Session = Depends(get_db)):
    import csv, io
    from fastapi.responses import StreamingResponse
    buf = io.StringIO()
    w = csv.writer(buf)  
    w.writerow([
        "ficha_id", "sector", "sensor", "deteccao_datetime",
        "deteccao_lat", "deteccao_lon",
        "periodo_inicio", "periodo_fim",
        "data_prevista", "data_efectiva", "observador", "equipa",
        "estado", "obj", "obs_id", "resultado", "resultado_outra",
        "data_obs", "notas", "campo_lat", "campo_lon",
        "evidencia_ref", "evidencia_nota", "natureza",
    ])
    visits = db.query(models.Visit).all()
    for v in visits:
        obs = db.query(models.Observation).filter_by(visit_id=v.id).all()
        if not obs:
            w.writerow([
                v.id, v.sector, v.sensor or "", v.detection_datetime or "",
                v.detection_lat or "", v.detection_lon or "",
                v.period_start, v.period_end,
                v.planned_date or "", v.effective_date or "",
                v.observer or "", v.team or "",
                v.status, v.objective,
                "", "", "", "", "", "", "", "", "", "",
            ])
        for o in obs:
            w.writerow([
                v.id, v.sector, v.sensor or "", v.detection_datetime or "",
                v.detection_lat or "", v.detection_lon or "",
                v.period_start, v.period_end,
                v.planned_date or "", v.effective_date or "",
                v.observer or "", v.team or "",
                v.status, v.objective,
                o.id, o.result, o.result_other or "",
                o.observed_date or "", o.notes or "",
                o.field_lat or "", o.field_lon or "",
                o.evidence_ref or "", o.evidence_note or "",
                o.nature,
            ])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=summary.csv"},
    )