import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# Valid service types
SERVICE_TYPES = ["food", "stay", "toilet", "medical", "water", "rest", "transport"]


class AmenityCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    service_type: str = Field(..., description="One of: food, stay, toilet, medical, water, rest, transport")
    description: Optional[str] = None
    address: Optional[str] = None
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    contact: Optional[str] = None
    is_free: bool = True


class AmenityResponse(BaseModel):
    id: uuid.UUID
    name: str
    service_type: str
    description: Optional[str]
    address: Optional[str]
    lat: float
    lng: float
    contact: Optional[str]
    is_free: bool
    contributor_id: Optional[uuid.UUID]
    contributor_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
