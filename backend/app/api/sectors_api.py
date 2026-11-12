from fastapi import APIRouter
from app.services.sectors import sector_grid

router = APIRouter()

@router.get("/sectors")
async def get_sectors():
    return {
        "sectors": [
            {"name": name, "bounds": list(b)}
            for name, b in sector_grid().items()
        ]
    }