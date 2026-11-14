from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()


def _to_out(v: models.Visit) -> schemas.VisitOut:
    return schemas.VisitOut(
        id=v.id, sector=v.sector, period_start=v.period_start,
        period_end=v.period_end, objective=v.objective,
        planned_date=v.planned_date, effective_date=v.effective_date,
        observer=v.observer, team=v.team,
        detection_ids=v.detection_ids, sensor=v.sensor,
        detection_datetime=v.detection_datetime,
        detection_lat=v.detection_lat, detection_lon=v.detection_lon,
        status=v.status, created_at=v.created_at.isoformat(),
    )


def _log(db: Session, visit_id: int, action: str, detail: str = ""):
    db.add(models.VisitHistory(visit_id=visit_id, action=action, detail=detail))


@router.post("/visits", response_model=schemas.VisitOut)
def create_visit(payload: schemas.VisitCreate, db: Session = Depends(get_db)):
    v = models.Visit(**payload.dict())
    db.add(v)
    db.commit()
    db.refresh(v)
    _log(db, v.id, "criada", f"Sector {v.sector}, período {v.period_start} → {v.period_end}")
    db.commit()
    return _to_out(v)


@router.get("/visits", response_model=list[schemas.VisitOut])
def list_visits(db: Session = Depends(get_db)):
    vs = db.query(models.Visit).order_by(models.Visit.id.desc()).all()
    return [_to_out(v) for v in vs]


@router.get("/visits/{visit_id}", response_model=schemas.VisitOut)
def get_visit(visit_id: int, db: Session = Depends(get_db)):
    v = db.query(models.Visit).get(visit_id)
    if not v:
        raise HTTPException(404, "Visita não encontrada")
    return _to_out(v)


@router.patch("/visits/{visit_id}/status", response_model=schemas.VisitOut)
def update_status(visit_id: int, payload: schemas.VisitStatusUpdate,
                  db: Session = Depends(get_db)):
    v = db.query(models.Visit).get(visit_id)
    if not v:
        raise HTTPException(404, "Visita não encontrada")
    old = v.status
    v.status = payload.status
    _log(db, v.id, "estado", f"{old} → {v.status}")
    db.commit()
    db.refresh(v)
    return _to_out(v)


@router.get("/visits/{visit_id}/history")
def get_history(visit_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(models.VisitHistory)
        .filter_by(visit_id=visit_id)
        .order_by(models.VisitHistory.id.asc())
        .all()
    )
    return [
        {"id": r.id, "action": r.action, "detail": r.detail,
         "created_at": r.created_at.isoformat()}
        for r in rows
    ]


@router.post("/observations", response_model=schemas.ObservationOut)
def create_observation(payload: schemas.ObservationCreate,
                       db: Session = Depends(get_db)):
    visit = db.query(models.Visit).get(payload.visit_id)
    if not visit:
        raise HTTPException(404, "Visita não encontrada")

    if payload.result == "outra" and not payload.result_other:
        raise HTTPException(422, "Preenche 'result_other' quando o resultado é 'outra'.")

    o = models.Observation(**payload.dict())
    db.add(o)
    db.flush()

    _log(db, visit.id, "observacao",
         f"Resultado: {o.result} · natureza: {o.nature}")

    # A visita passa a "realizada" quando há observação, excepto se já estava
    # marcada como inconclusiva ou não realizada (estados explícitos do terreno).
    if visit.status in ("planeada", "em_curso"):
        visit.status = "realizada"

    db.commit()
    db.refresh(o)
    return schemas.ObservationOut(
        id=o.id, visit_id=o.visit_id, result=o.result,
        result_other=o.result_other, observed_date=o.observed_date,
        notes=o.notes, field_lat=o.field_lat, field_lon=o.field_lon,
        evidence_ref=o.evidence_ref, evidence_note=o.evidence_note,
        nature=o.nature, created_at=o.created_at.isoformat(),
    )


@router.get("/observations/{visit_id}", response_model=list[schemas.ObservationOut])
def list_observations(visit_id: int, db: Session = Depends(get_db)):
    obs = db.query(models.Observation).filter_by(visit_id=visit_id).all()
    return [
        schemas.ObservationOut(
            id=o.id, visit_id=o.visit_id, result=o.result,
            result_other=o.result_other, observed_date=o.observed_date,
            notes=o.notes, field_lat=o.field_lat, field_lon=o.field_lon,
            evidence_ref=o.evidence_ref, evidence_note=o.evidence_note,
            nature=o.nature, created_at=o.created_at.isoformat(),
        )
        for o in obs
    ]