
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models

from app.api import detections, calendar, sectors_api, visits, export


app = FastAPI(
    title="Gorongosa FireLink API",
    description="API para monitorização e gestão de incêndios no Parque Nacional da Gorongosa.",
    version="1.0.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restringir em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar tabelas
Base.metadata.create_all(bind=engine)

# Registar routers
app.include_router(detections.router)
app.include_router(calendar.router)
app.include_router(sectors_api.router)
app.include_router(visits.router)
app.include_router(export.router)


@app.get("/")
def root():
    return {
        "message": "Gorongosa FireLink API is running",
        "status": "online"
    }
