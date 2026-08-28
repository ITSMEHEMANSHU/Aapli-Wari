from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.supabase import supabase
from backend.app.db.database import get_db
from backend.app.models.rbac import (
    Permission,
    RolePermission,
    RoutePermission,
)
from backend.app.models.user import User


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> User:

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        response = supabase.auth.get_user(
            credentials.credentials
        )
        auth_user = response.user

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    if auth_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    user = db.get(
        User,
        UUID(str(auth_user.id)),
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application user profile not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user


def authorize_request(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> User | None:

    route = request.scope.get("route")

    if route is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Route authorization unavailable",
        )

    route_permission = db.execute(
        select(RoutePermission)
        .where(
            RoutePermission.method == request.method.upper(),
            RoutePermission.route_path == route.path,
            RoutePermission.is_active.is_(True),
        )
    ).scalar_one_or_none()

    if route_permission is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endpoint is not configured for authorization",
        )

    if not route_permission.requires_auth:
        return None

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        response = supabase.auth.get_user(
            credentials.credentials
        )
        auth_user = response.user

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    if auth_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    user = db.get(
        User,
        UUID(str(auth_user.id)),
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application user profile not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    permission_id = db.execute(
        select(Permission.id)
        .join(
            RolePermission,
            RolePermission.permission_id == Permission.id,
        )
        .where(
            RolePermission.role_id == user.role_id,
            Permission.id == route_permission.permission_id,
        )
    ).scalar_one_or_none()

    if permission_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )

    return user