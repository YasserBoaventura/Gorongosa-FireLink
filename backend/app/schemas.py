from pydantic import BaseModel
from typing import Optional, List

class FireDetection(BaseModel):
    latitude: float
    longitude: float
    brightness: Optional[float] = None
    acq_date: str
    acq_time: Optional[str] = None
    satellite: str
    instrument: str
    confidence: Optional[str] = None
    frp: Optional[float] = None
    daynight: Optional[str] = None
    source: str
    sector: Optional[str] = None

class DetectionResponse(BaseModel):
    detections: List[FireDetection]
    query: dict
    limitations: str

class CalendarDay(BaseModel):
    date: str
    count: int
    modis: int
    viirs: int

class CalendarResponse(BaseModel):
    days: List[CalendarDay]
    sectors: dict
    reference: dict
    limitations: str

class SectorHighlight(BaseModel):
    sector: str
    detection_days: int
    total_detections: int
    last_date: Optional[str]
    reason: str

class VisitCreate(BaseModel):
    sector: str
    period_start: str
    period_end: str
    objective: str
    planned_date: Optional[str] = None

class VisitOut(VisitCreate):
    id: int
    status: str
    created_at: str

    class Config:
        from_attributes = True

class ObservationCreate(BaseModel):
    visit_id: int
    result: str  # presenca | ausencia | inconclusivo
    observed_date: Optional[str] = None
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    simulated: bool = False

class ObservationOut(ObservationCreate):
    id: int
    created_at: str

    class Config:
        from_attributes = True