from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    hour: int                = Field(..., ge=6, le=22)
    day_of_week: int         = Field(..., ge=0, le=6)
    semester_progress: float = Field(..., ge=0, le=1)
    weather: int             = Field(..., ge=0, le=8)
    temperature: float

class PredictionResponse(BaseModel):
    occupancy: float
    is_closed: bool

class OccupancyResponse(BaseModel):
    occupancy: float
    is_closed: bool