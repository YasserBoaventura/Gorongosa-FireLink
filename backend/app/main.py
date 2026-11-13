
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models

from app.api import detections, calendar, sectors_api, visits, export, alerts

app = FastAPI(
    title="Gorongosa FireLink API",
    description="API para monitorização e gestão de incêndios no Parque Nacional da Gorongosa.",
    version="1.0.0"
)


# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gorongosa-fire-link-j7g8rrseq-myproject-e143.vercel.app",
        "https://gorongosa-fire-link.vercel.app"
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Criar tabelas
Base.metadata.create_all(bind=engine)

# Registar routers
app.include_router(detections.router, prefix="/api/v1")
app.include_router(calendar.router, prefix="/api/v1")
app.include_router(sectors_api.router, prefix="/api/v1")
app.include_router(visits.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Gorongosa FireLink API is running",
        "status": "online"
    }
