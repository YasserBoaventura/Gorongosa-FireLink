
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.database import Base


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String(100), nullable=False)
    period_start = Column(String(30), nullable=False)
    period_end = Column(String(30), nullable=False)
    objective = Column(String(255), nullable=False)
    planned_date = Column(String(30), nullable=True)
    status = Column(String(30), default="planeada")
    created_at = Column(DateTime, default=datetime.utcnow)


class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, nullable=False)
    result = Column(String(30), nullable=False)
    observed_date = Column(String(30), nullable=True)
    notes = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    simulated = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
