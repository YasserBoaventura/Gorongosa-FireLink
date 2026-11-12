from fastapi import APIRouter, Query
from app.services.firms import fetch_detections
from app.schemas import DetectionResponse
from app.config import settings

router = APIRouter()

@router.get("/detections", response_model=DetectionResponse)
async def get_detections(
    days: int = Query(3, ge=1, le=5),
    source: str = Query("both", pattern="^(modis|viirs|both)$"),
):
    all_det = []
    if source in ("modis", "both"):
        all_det.extend(await fetch_detections("MODIS_NRT", days))
    if source in ("viirs", "both"):
        all_det.extend(await fetch_detections("VIIRS_SNPP_NRT", days))
    return DetectionResponse(
        detections=all_det,
        query={"days": days, "source": source,
               "bbox": [settings.gorongosa_west, settings.gorongosa_south,
                        settings.gorongosa_east, settings.gorongosa_north]},
        limitations=("Uma detecção FIRMS indica foco de calor/anomalia térmica; "
                     "não confirma incêndio nem mede área ardida. Nuvens, fumo "
                     "e o intervalo entre passagens podem causar omissões."),
    )