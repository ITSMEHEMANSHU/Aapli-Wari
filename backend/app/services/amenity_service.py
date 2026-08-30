from sqlalchemy.orm import Session

from backend.app.models.amenity import Amenity
from backend.app.models.user import User
from backend.app.schemas.amenity import AmenityCreate, SERVICE_TYPES
from fastapi import HTTPException, status


def create_amenity(db: Session, data: AmenityCreate, contributor: User) -> Amenity:
    if data.service_type not in SERVICE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid service_type. Must be one of: {', '.join(SERVICE_TYPES)}",
        )

    amenity = Amenity(
        name=data.name,
        service_type=data.service_type,
        description=data.description,
        address=data.address,
        lat=data.lat,
        lng=data.lng,
        contact=data.contact,
        is_free=data.is_free,
        contributor_id=contributor.id,
    )
    db.add(amenity)
    db.commit()
    db.refresh(amenity)
    return amenity


def list_amenities(db: Session, service_type: str | None = None) -> list[Amenity]:
    query = db.query(Amenity)
    if service_type:
        query = query.filter(Amenity.service_type == service_type)
    return query.order_by(Amenity.created_at.desc()).all()


def get_amenity(db: Session, amenity_id) -> Amenity:
    amenity = db.query(Amenity).filter(Amenity.id == amenity_id).first()
    if not amenity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Amenity not found",
        )
    return amenity


def delete_amenity(db: Session, amenity_id, current_user: User) -> None:
    amenity = get_amenity(db, amenity_id)
    if amenity.contributor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own amenities",
        )
    db.delete(amenity)
    db.commit()
