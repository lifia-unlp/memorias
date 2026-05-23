import time
from typing import Final, final

from copilot.models import Message, SessionId


@final
class Session:
    def __init__(self, session_id: SessionId, timeout_seconds: int) -> None:
        self._session_id: Final[SessionId] = session_id
        self._timeout_seconds: Final[int] = timeout_seconds
        self._messages: list[Message] = []
        self._last_accessed: float = time.time()

    @property
    def session_id(self) -> SessionId:
        return self._session_id

    @property
    def messages(self) -> list[Message]:
        self.update_access()
        return list(self._messages)

    def set_messages(self, messages: list[Message]) -> None:
        self.update_access()
        self._messages = list(messages)

    def update_access(self) -> None:
        self._last_accessed = time.time()

    def is_expired(self) -> bool:
        return time.time() - self._last_accessed > self._timeout_seconds


@final
class InMemorySessionManager:
    def __init__(self, timeout_seconds: int) -> None:
        self._timeout_seconds: Final[int] = timeout_seconds
        self._sessions: dict[SessionId, Session] = {}

    def get_or_create_session(self, session_id: SessionId) -> Session:
        self.cleanup_expired()
        if session_id not in self._sessions:
            self._sessions[session_id] = Session(session_id, self._timeout_seconds)
        return self._sessions[session_id]

    def cleanup_expired(self) -> None:
        expired_ids = [sid for sid, s in self._sessions.items() if s.is_expired()]
        for sid in expired_ids:
            del self._sessions[sid]
