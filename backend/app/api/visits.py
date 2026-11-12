from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.post("/visits", response_model=schemas.VisitOut)
def create_visit(payload: schemas.VisitCreate, db: Session = Depends(get_db)):
    v = models.Visit(**payload.dict())
    db.add(v); db.commit(); db.refresh(v)
    return schemas.VisitOut(
        id=v.id, sector=v.sector, period_start=v.period_start,
        period_end=v.period_end, objective=v.objective,
        planned_date=v.planned_date, status=v.status,
        created_at=v.created_at.isoformat(),
    )

@router.get("/visits", response_model=list[schemas.VisitOut])
def list_visits(db: Session = Depends(get_db)):
    vs = db.query(models.Visit).order_by(models.Visit.id.desc()).all()
    return [
        schemas.VisitOut(
            id=v.id, sector=v.sector, period_start=v.period_start,
            period_end=v.period_end, objective=v.objective,
            planned_date=v.planned_date, status=v.status,
            created_at=v.created_at.isoformat(),
        ) for v in vs
    ]

@router.post("/observations", response_model=schemas.ObservationOut)
def create_observation(payload: schemas.ObservationCreate,
                       db: Session = Depends(get_db)):
    visit = db.query(models.Visit).get(payload.visit_id)
    if not visit:
        raise HTTPException(404, "Visita não encontrada")
    o = models.Observation(
        visit_id=payload.visit_id, result=payload.result,
        observed_date=payload.observed_date, notes=payload.notes,
        latitude=payload.latitude, longitude=payload.longitude,
        simulated=1 if payload.simulated else 0,
    )
    db.add(o); db.commit(); db.refresh(o)
    visit.status = "realizada"
    db.commit()
    return schemas.ObservationOut(
        id=o.id, visit_id=o.visit_id, result=o.result,
        observed_date=o.observed_date, notes=o.notes,
        latitude=o.latitude, longitude=o.longitude,
        simulated=bool(o.simulated), created_at=o.created_at.isoformat(),
    )

@router.get("/observations/{visit_id}", response_model=list[schemas.ObservationOut])
def list_observations(visit_id: int, db: Session = Depends(get_db)):
    obs = db.query(models.Observation).filter_by(visit_id=visit_id).all()
    return [
        schemas.ObservationOut(
            id=o.id, visit_id=o.visit_id, result=o.result,
            observed_date=o.observed_date, notes=o.notes,
            latitude=o.latitude, longitude=o.longitude,
            simulated=bool(o.simulated), created_at=o.created_at.isoformat(),
        ) for o in obs
    ]