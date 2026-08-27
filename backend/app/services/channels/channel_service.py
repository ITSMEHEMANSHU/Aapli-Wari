from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.channel import Channel
from backend.app.models.palkhi import Palkhi
from backend.app.models.rbac import Role, VerificationStatus
from backend.app.models.user import User
from backend.app.schemas.channel import (
    ChannelCreate,
    ChannelUpdate,
    PalkhiCreate,
)

from backend.app.models.channel_join_request import ChannelJoinRequest

def create_palkhi(
    db: Session,
    data: PalkhiCreate,
    owner: User,
) -> Palkhi:

    existing = db.scalar(
        select(Palkhi).where(
            Palkhi.owner_user_id == owner.id
        )
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already owns a Palkhi",
        )

    pending_status = db.scalar(
        select(VerificationStatus).where(
            VerificationStatus.name == "pending"
        )
    )

    if pending_status is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Pending verification status is not configured",
        )

    palkhi = Palkhi(
        name=data.name,
        description=data.description,
        owner_user_id=owner.id,
        verification_status_id=pending_status.id,
    )

    db.add(palkhi)
    db.commit()
    db.refresh(palkhi)

    return palkhi

def get_my_palkhi(
    db: Session,
    owner: User,
) -> Palkhi:

    palkhi = db.scalar(
        select(Palkhi).where(
            Palkhi.owner_user_id == owner.id
        )
    )

    if palkhi is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You do not have a Palkhi",
        )

    return palkhi


def create_channel(
    db: Session,
    data: ChannelCreate,
    creator: User,
) -> Channel:

    palkhi = db.get(Palkhi, data.palkhi_id)

    if palkhi is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Palkhi not found",
        )

    if palkhi.owner_user_id != creator.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the Palkhi owner can create its channel",
        )

    if palkhi.channel is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Palkhi already has a channel",
        )

    channel = Channel(
        name=data.name,
        description=data.description,
        palkhi_id=palkhi.id,
        created_by_user_id=creator.id,
    )

    db.add(channel)
    db.commit()
    db.refresh(channel)

    return channel


def update_channel(
    db: Session,
    channel: Channel,
    data: ChannelUpdate,
) -> Channel:

    if channel.status != "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Channel is inactive",
        )

    if data.name is not None:
        channel.name = data.name

    if data.description is not None:
        channel.description = data.description

    db.commit()
    db.refresh(channel)

    return channel


def get_channel(
    db: Session,
    channel_id: UUID,
) -> Channel:

    channel = db.get(Channel, channel_id)

    if channel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found",
        )

    return channel


def list_channels(
    db: Session,
) -> list[Channel]:

    return list(
        db.scalars(
            select(Channel)
            .where(Channel.status == "active")
            .order_by(Channel.created_at.desc())
        ).all()
    )

def create_join_request(
    db: Session,
    channel: Channel,
    requester: User,
) -> ChannelJoinRequest:

    if channel.status != "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Channel is inactive",
        )

    role = db.get(Role, requester.role_id)

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User role is not configured",
        )

    if role.name != "contributor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only contributors can request to join a channel",
        )

    if requester in channel.contributors:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already a contributor of this channel",
        )

    existing_request = db.scalar(
        select(ChannelJoinRequest).where(
            ChannelJoinRequest.channel_id == channel.id,
            ChannelJoinRequest.user_id == requester.id,
            ChannelJoinRequest.status == "pending",
        )
    )

    if existing_request is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Join request is already pending",
        )

    join_request = ChannelJoinRequest(
        channel_id=channel.id,
        user_id=requester.id,
        status="pending",
    )

    db.add(join_request)
    db.commit()
    db.refresh(join_request)

    return join_request

def get_my_join_request(
    db: Session,
    channel: Channel,
    requester: User,
) -> ChannelJoinRequest | None:

    return db.scalar(
        select(ChannelJoinRequest)
        .where(
            ChannelJoinRequest.channel_id == channel.id,
            ChannelJoinRequest.user_id == requester.id,
        )
        .order_by(
            ChannelJoinRequest.created_at.desc()
        )
    )

def decide_join_request(
    db: Session,
    channel: Channel,
    request_id: UUID,
    action: str,
) -> ChannelJoinRequest:

    if action not in {"approve", "reject"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action must be approve or reject",
        )

    join_request = db.scalar(
        select(ChannelJoinRequest).where(
            ChannelJoinRequest.id == request_id,
            ChannelJoinRequest.channel_id == channel.id,
        )
    )

    if join_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Join request not found",
        )

    if join_request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Join request has already been processed",
        )

    if action == "approve":

        contributor = db.get(
            User,
            join_request.user_id,
        )

        if contributor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requesting user not found",
            )

        role = db.get(
            Role,
            contributor.role_id,
        )

        if role is None or role.name != "contributor":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Requesting user is no longer a contributor",
            )

        if contributor not in channel.contributors:
            channel.contributors.append(contributor)

        join_request.status = "approved"

    else:
        join_request.status = "rejected"

    db.commit()
    db.refresh(join_request)

    return join_request

def get_channel_join_requests(
    db: Session,
    channel: Channel,
) -> list[ChannelJoinRequest]:

    return list(
        db.scalars(
            select(ChannelJoinRequest).where(
                ChannelJoinRequest.channel_id == channel.id,
                ChannelJoinRequest.status == "pending",
            ).order_by(
                ChannelJoinRequest.created_at.asc()
            )
        ).all()
    )


def get_channel_contributors(
    db: Session,
    channel: Channel,
) -> list[User]:

    if channel.status != "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Channel is inactive",
        )

    return channel.contributors


def assign_contributor(
    db: Session,
    channel: Channel,
    contributor_id: UUID,
) -> Channel:

    if channel.status != "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Channel is inactive",
        )

    contributor = db.get(User, contributor_id)

    if contributor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    role = db.get(Role, contributor.role_id)

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User role is not configured",
        )

    if role.name != "contributor":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only contributors can be assigned to a channel",
        )

    if contributor not in channel.contributors:
        channel.contributors.append(contributor)

    db.commit()
    db.refresh(channel)

    return channel


def remove_contributor(
    db: Session,
    channel: Channel,
    contributor_id: UUID,
) -> Channel:

    if channel.status != "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Channel is inactive",
        )

    contributor = next(
        (
            user
            for user in channel.contributors
            if user.id == contributor_id
        ),
        None,
    )

    if contributor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contributor is not assigned to this channel",
        )

    channel.contributors.remove(contributor)

    db.commit()
    db.refresh(channel)

    return channel


def set_channel_status(
    db: Session,
    channel: Channel,
    new_status: str,
) -> Channel:

    if new_status not in {"active", "inactive"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid channel status",
        )

    channel.status = new_status

    db.commit()
    db.refresh(channel)

    return channel