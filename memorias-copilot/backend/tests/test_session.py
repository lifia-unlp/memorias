from copilot.models import Message, SessionId
from copilot.session import InMemorySessionManager, Session


def test_session_creation_and_update() -> None:
    session_id = SessionId("test-session")
    manager = InMemorySessionManager(timeout_seconds=2)
    session = manager.get_or_create_session(session_id)
    assert session.session_id == session_id
    assert len(session.messages) == 0

    messages = [Message(role="user", content="Hello")]
    session.set_messages(messages)
    assert len(session.messages) == 1
    assert session.messages[0].content == "Hello"


def test_session_expiration() -> None:
    session_id = SessionId("test-expiring")
    # Set a negative timeout to instantly expire the session
    session = Session(session_id, timeout_seconds=-1)
    assert session.is_expired() is True

    manager = InMemorySessionManager(timeout_seconds=-1)
    manager.get_or_create_session(session_id)
    # Cleanup should remove the expired session
    manager.cleanup_expired()
    # A subsequent call creates a new session since the previous was deleted
    new_session = manager.get_or_create_session(session_id)
    assert len(new_session.messages) == 0
