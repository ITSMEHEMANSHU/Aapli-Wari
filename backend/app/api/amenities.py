import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.amenity import AmenityCreate, AmenityResponse
from backend.app.services.amenity_service import (
    create_amenity,
    delete_amenity,
    get_amenity,
    list_amenities,
)

router = APIRouter(prefix="/amenities", tags=["Amenities"])


# ── GET /amenities/ — public, all users can see ──────────────────────────────
@router.get("", response_model=list[AmenityResponse])
def get_amenities(
    service_type: Optional[str] = Query(None, description="Filter by type"),
    db: Session = Depends(get_db),
):
    amenities = list_amenities(db=db, service_type=service_type)

    result = []
    for a in amenities:
        contributor_name = None
        if a.contributor:
            contributor_name = (
                a.contributor.full_name
                or a.contributor.username
                or a.contributor.email
            )
        result.append(
            AmenityResponse(
                id=a.id,
                name=a.name,
                service_type=a.service_type,
                description=a.description,
                address=a.address,
                lat=a.lat,
                lng=a.lng,
                contact=a.contact,
                is_free=a.is_free,
                contributor_id=a.contributor_id,
                contributor_name=contributor_name,
                created_at=a.created_at,
                updated_at=a.updated_at,
            )
        )
    return result


# ── POST /amenities/ — contributor adds amenity ───────────────────────────────
@router.post("", response_model=AmenityResponse, status_code=201)
def add_amenity(
    data: AmenityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    amenity = create_amenity(db=db, data=data, contributor=current_user)
    contributor_name = (
        current_user.full_name
        or current_user.username
        or current_user.email
    )
    return AmenityResponse(
        id=amenity.id,
        name=amenity.name,
        service_type=amenity.service_type,
        description=amenity.description,
        address=amenity.address,
        lat=amenity.lat,
        lng=amenity.lng,
        contact=amenity.contact,
        is_free=amenity.is_free,
        contributor_id=amenity.contributor_id,
        contributor_name=contributor_name,
        created_at=amenity.created_at,
        updated_at=amenity.updated_at,
    )


# ── GET /amenities/{id} — single amenity ─────────────────────────────────────
@router.get("/{amenity_id}", response_model=AmenityResponse)
def get_single_amenity(
    amenity_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    a = get_amenity(db=db, amenity_id=amenity_id)
    contributor_name = None
    if a.contributor:
        contributor_name = (
            a.contributor.full_name
            or a.contributor.username
            or a.contributor.email
        )
    return AmenityResponse(
        id=a.id,
        name=a.name,
        service_type=a.service_type,
        description=a.description,
        address=a.address,
        lat=a.lat,
        lng=a.lng,
        contact=a.contact,
        is_free=a.is_free,
        contributor_id=a.contributor_id,
        contributor_name=contributor_name,
        created_at=a.created_at,
        updated_at=a.updated_at,
    )


# ── DELETE /amenities/{id} — contributor deletes own amenity ─────────────────
@router.delete("/{amenity_id}", status_code=204)
def remove_amenity(
    amenity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_amenity(db=db, amenity_id=amenity_id, current_user=current_user)
