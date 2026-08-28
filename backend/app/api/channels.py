from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.security import authorize_request
from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.channel import (
    ChannelCreate,
    ChannelResponse,
    ChannelUpdate,
    ContributorAssignment,
    PalkhiCreate,
    PalkhiResponse,
    ChannelJoinRequestResponse,
    ChannelJoinRequestDetailResponse,
    JoinRequestDecision,
    ChannelPostCreate,
    ChannelPostResponse,
    ChannelFeedItemResponse,
)
from backend.app.services.channels.channel_service import (
    assign_contributor,
    create_channel,
    create_join_request,
    create_palkhi,
    decide_join_request as process_join_request,
    get_channel,
    get_channel_contributors,
    get_channel_join_requests,
    get_my_join_request,
    get_my_join_requests,
    get_my_palkhi,
    get_my_channel_memberships,
    list_channels,
    remove_contributor,
    set_channel_status,
    update_channel,
)
from backend.app.services.channels.post_service import create_channel_post, list_channel_posts


router = APIRouter(
    prefix="/channels",
    tags=["Channels"],
)


@router.get(
    "/{channel_id}/posts",
    response_model=list[ChannelFeedItemResponse],
)
def posts(
    channel_id: UUID,
    _: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(db=db, channel_id=channel_id)
    if channel.status != "active":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")
    return list_channel_posts(db=db, channel_id=channel.id)


@router.post(
    "/{channel_id}/posts",
    response_model=ChannelPostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(
    channel_id: UUID,
    data: ChannelPostCreate,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    message = data.message.strip()
    if not message:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Message cannot be empty")
    channel = get_channel(db=db, channel_id=channel_id)
    return create_channel_post(db=db, channel=channel, user=current_user, message=message)


# =========================================================
# PALKHI
# =========================================================

@router.post(
    "/palkhis",
    response_model=PalkhiResponse,
)
def register_palkhi(
    data: PalkhiCreate,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    return create_palkhi(
        db=db,
        data=data,
        owner=current_user,
    )


@router.get(
    "/palkhis/me",
    response_model=PalkhiResponse,
)
def my_palkhi(
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    return get_my_palkhi(
        db=db,
        owner=current_user,
    )


# =========================================================
# CHANNELS
# =========================================================

@router.post(
    "",
    response_model=ChannelResponse,
)
def create(
    data: ChannelCreate,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    return create_channel(
        db=db,
        data=data,
        creator=current_user,
    )


@router.get(
    "",
    response_model=list[ChannelResponse],
)
def list_all(
    _: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    return list_channels(db=db)


# =========================================================
# CURRENT USER'S CHANNEL MEMBERSHIPS
# IMPORTANT: BEFORE /{channel_id}
# =========================================================

@router.get(
    "/my-memberships",
    response_model=list[ChannelResponse],
)
def my_channel_memberships(
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    return get_my_channel_memberships(
        db=db,
        user=current_user,
    )


@router.get(
    "/my-join-requests",
    response_model=list[ChannelJoinRequestResponse],
)
def my_join_requests(
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    return get_my_join_requests(
        db=db,
        requester=current_user,
    )


# =========================================================
# GET SINGLE CHANNEL
# =========================================================

@router.get(
    "/{channel_id}",
    response_model=ChannelResponse,
)
def get(
    channel_id: UUID,
    _: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    if channel.status != "active":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found",
        )

    return channel


# =========================================================
# UPDATE CHANNEL
# =========================================================

@router.patch(
    "/{channel_id}",
    response_model=ChannelResponse,
)
def update(
    channel_id: UUID,
    data: ChannelUpdate,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    if channel.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the channel owner can update this channel",
        )

    return update_channel(
        db=db,
        channel=channel,
        data=data,
    )


# =========================================================
# JOIN REQUEST - CREATE
# =========================================================

@router.post(
    "/{channel_id}/join-request",
    response_model=ChannelJoinRequestResponse,
)
def request_to_join_channel(
    channel_id: UUID,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    return create_join_request(
        db=db,
        channel=channel,
        requester=current_user,
    )


# =========================================================
# JOIN REQUEST - CURRENT USER
# =========================================================

@router.get(
    "/{channel_id}/join-request/me",
    response_model=ChannelJoinRequestResponse | None,
)
def get_my_channel_join_request(
    channel_id: UUID,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    return get_my_join_request(
        db=db,
        channel=channel,
        requester=current_user,
    )


# =========================================================
# JOIN REQUEST - LIST FOR CHANNEL OWNER
# =========================================================

@router.get(
    "/{channel_id}/join-requests",
    response_model=list[ChannelJoinRequestDetailResponse],
)
def list_join_requests(
    channel_id: UUID,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    if channel.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the channel owner can view join requests",
        )

    requests = get_channel_join_requests(
        db=db,
        channel=channel,
    )

    result = []

    for request in requests:
        user = db.get(User, request.user_id)

        if user is None:
            continue

        result.append(
            {
                "id": request.id,
                "channel_id": request.channel_id,
                "user_id": request.user_id,
                "status": request.status,
                "created_at": request.created_at,
                "updated_at": request.updated_at,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "username": user.username,
                },
            }
        )

    return result


# =========================================================
# JOIN REQUEST - APPROVE / REJECT
# =========================================================

@router.patch(
    "/{channel_id}/join-requests/{request_id}",
    response_model=ChannelJoinRequestResponse,
)
def decide_join_request(
    channel_id: UUID,
    request_id: UUID,
    data: JoinRequestDecision,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    if channel.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the channel owner can manage join requests",
        )

    return process_join_request(
        db=db,
        channel=channel,
        request_id=request_id,
        action=data.action,
    )


# =========================================================
# CONTRIBUTORS - LIST
# =========================================================

@router.get(
    "/{channel_id}/contributors",
)
def contributors(
    channel_id: UUID,
    _: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    users = get_channel_contributors(
        db=db,
        channel=channel,
    )

    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "username": user.username,
        }
        for user in users
    ]


# =========================================================
# CONTRIBUTORS - ADD
# =========================================================

@router.post(
    "/{channel_id}/contributors",
)
def add_contributor(
    channel_id: UUID,
    data: ContributorAssignment,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    if channel.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the channel owner can manage contributors",
        )

    assign_contributor(
        db=db,
        channel=channel,
        contributor_id=data.user_id,
    )

    return {
        "message": "Contributor assigned successfully",
    }


# =========================================================
# CONTRIBUTORS - REMOVE
# =========================================================

@router.delete(
    "/{channel_id}/contributors/{user_id}",
)
def delete_contributor(
    channel_id: UUID,
    user_id: UUID,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    if channel.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the channel owner can manage contributors",
        )

    remove_contributor(
        db=db,
        channel=channel,
        contributor_id=user_id,
    )

    return {
        "message": "Contributor removed successfully",
    }


# =========================================================
# CHANNEL STATUS
# =========================================================

@router.patch(
    "/{channel_id}/status",
    response_model=ChannelResponse,
)
def change_status(
    channel_id: UUID,
    new_status: str,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    channel = get_channel(
        db=db,
        channel_id=channel_id,
    )

    if channel.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the channel owner can change channel status",
        )

    return set_channel_status(
        db=db,
        channel=channel,
        new_status=new_status,
    )