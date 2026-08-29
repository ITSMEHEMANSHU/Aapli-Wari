import uuid

from backend.app.models.channel import Channel
from backend.app.models.palkhi import Palkhi
from backend.app.models.user import User


def test_channel_owner_name_uses_palkhi_owner_full_name():
    owner = User(
        id=uuid.uuid4(),
        email='owner@example.com',
        username='ramdas',
        full_name='Ramdas Maharaj',
        role='palkhi_pramukh',
    )
    palkhi = Palkhi(
        id=uuid.uuid4(),
        name='Shri Ramdas Palkhi',
        description='Test palkhi',
        owner_user_id=owner.id,
        verification_status_id=uuid.uuid4(),
        owner=owner,
    )
    channel = Channel(
        id=uuid.uuid4(),
        name='Test Channel',
        description='Demo channel',
        palkhi_id=palkhi.id,
        created_by_user_id=owner.id,
        status='active',
        palkhi=palkhi,
        created_by=owner,
    )

    assert channel.owner_name == 'Ramdas Maharaj'
    assert channel.created_by_name == 'Ramdas Maharaj'
