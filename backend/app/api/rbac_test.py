from fastapi import APIRouter, Depends, HTTPException

from backend.app.core.security import get_current_user
from backend.app.models.user import User


router = APIRouter(
    prefix="/rbac-test",
    tags=["RBAC"],
)


@router.get("/user")
def user_route(_: User = Depends(get_current_user)):
    return {
        "message": "Explore permission granted",
    }


@router.get("/contributor")
def contributor_route(current_user: User = Depends(get_current_user)):
    if current_user.role not in ("contributor", "palkhi_pramukh", "admin"):
        raise HTTPException(status_code=403, detail="Contributor access required")
    return {
        "message": "Contributor permission granted",
    }


@router.get("/palkhi-pramukh")
def palkhi_pramukh_route(current_user: User = Depends(get_current_user)):
    if current_user.role not in ("palkhi_pramukh", "admin"):
        raise HTTPException(status_code=403, detail="Palkhi Pramukh access required")
    return {
        "message": "Palkhi management permission granted",
    }


@router.get("/admin")
def admin_route(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return {
        "message": "Admin permission granted",
    }