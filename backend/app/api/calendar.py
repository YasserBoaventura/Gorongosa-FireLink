from fastapi import APIRouter, Query
from app.services.firms import fetch_detections
from app.services.analysis import build_calendar, sector_summary, highlight_sectors
from app.schemas import CalendarResponse

router = APIRouter()

@router.get("/calendar", response_model=CalendarResponse)
async def get_calendar(days: int = Query(5, ge=1, le=10)):
    det = []
    det.extend(await fetch_detections("MODIS_NRT", days))
    det.extend(await fetch_detections("VIIRS_SNPP_NRT", days))
    days_list = build_calendar(det)
    sectors = sector_summary(det)
    highlights = highlight_sectors(det)
    return CalendarResponse(
        days=days_list,
        sectors=sectors,
        reference={"highlights": [h.dict() for h in highlights]},
        limitations=("Calendário baseado apenas em dias com detecção. Ausência "
                     "de detecção não prova ausência de fogo."),
    )

@router.get("/highlights")
async def get_highlights(days: int = Query(5, ge=1, le=5)):
    det = []
    det.extend(await fetch_detections("MODIS_NRT", days))
    det.extend(await fetch_detections("VIIRS_SNPP_NRT", days))
    return {"highlights": [h.dict() for h in highlight_sectors(det)],
            "sectors": sector_summary(det)}