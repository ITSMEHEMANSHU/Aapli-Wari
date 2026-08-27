from fastapi import APIRouter, Depends

from backend.app.core.security import authorize_request
from backend.app.models.user import User


router = APIRouter(
    prefix="/rbac-test",
    tags=["RBAC"],
)


@router.get("/user")
def user_route(_: User = Depends(authorize_request)):
    return {
        "message": "Explore permission granted",
    }


@router.get("/contributor")
def contributor_route(_: User = Depends(authorize_request)):
    return {
        "message": "Contributor permission granted",
    }


@router.get("/palkhi-pramukh")
def palkhi_pramukh_route(_: User = Depends(authorize_request)):
    return {
        "message": "Palkhi management permission granted",
    }


@router.get("/admin")
def admin_route(_: User = Depends(authorize_request)):
    return {
        "message": "Admin permission granted",
    }