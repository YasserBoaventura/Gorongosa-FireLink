from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from collections import Counter, defaultdict
from app.database import get_db
from app import models

router = APIRouter()
# router = APIRouter(
#     prefix="/report",
#     tags=["Reports"]
# )

@router.get("/report")
def get_report(db: Session = Depends(get_db)): 
    visits = db.query(models.Visit).all()
    observations = db.query(models.Observation).all()

    by_status = Counter(v.status for v in visits)
    by_sector = Counter(v.sector for v in visits)
    by_result = Counter(o.result for o in observations)
    by_nature = Counter(o.nature for o in observations)

    # visitas realizadas por sector
    realizada_by_sector = defaultdict(int)
    visit_map = {v.id: v for v in visits}
    for o in observations:
        v = visit_map.get(o.visit_id)
        if v and v.status == "realizada":
            realizada_by_sector[v.sector] += 1

    return {
        "totals": {
            "visits": len(visits),
            "observations": len(observations),
        },
        "by_status": dict(by_status),
        "by_sector": dict(by_sector),
        "by_result": dict(by_result),
        "by_nature": dict(by_nature),
        "realizada_by_sector": dict(realizada_by_sector),
        "limitations": (
            "Resumo baseado apenas em registos criados na aplicação. "
            "Não substitui a avaliação técnica do Parque."
        ),
    }