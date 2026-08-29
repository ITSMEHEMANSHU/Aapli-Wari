import uuid

from backend.app.ai.stt.service import set_processed_status
from backend.app.models.content import Content, ContentStatus, ContentType


def test_set_processed_status_for_verified_content_publishes_it():
    content = Content(
        title="Audio clip",
        content_type=ContentType.AUDIO,
        user_id=uuid.uuid4(),
        verified=True,
    )

    set_processed_status(content)

    assert content.status == ContentStatus.PUBLISHED


def test_set_processed_status_for_unverified_content_marks_processed():
    content = Content(
        title="Audio clip",
        content_type=ContentType.AUDIO,
        user_id=uuid.uuid4(),
        verified=False,
    )

    set_processed_status(content)

    assert content.status == ContentStatus.PROCESSED
