from collections.abc import AsyncIterator
from typing import Any
from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient

from copilot.llm import LLMProvider
from copilot.models import Message
from copilot.server import app, get_llm_provider
from tests.test_db import MockDatabaseAdapter


class MockLLMProvider(LLMProvider):
    async def stream_completions(
        self,
        messages: list[Message],
        dispatcher: Any = None,
        session_id: str | None = None,
        user_info: Any = None,
    ) -> AsyncIterator[str]:
        if user_info:
            yield f"Hello {user_info.memberName or user_info.name}"
        else:
            yield "Hello"
        yield "\n"
        yield "World"


@pytest.mark.asyncio
async def test_chat_endpoint() -> None:
    # Inject MockLLMProvider into the server dependencies
    app.dependency_overrides[get_llm_provider] = lambda: MockLLMProvider()

    mock_db = MockDatabaseAdapter()

    # Patch server db_adapter and tool_dispatcher to isolate from real network during test
    with (
        patch("copilot.server.db_adapter", mock_db),
        patch("copilot.server.tool_dispatcher._db", mock_db),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            response = await ac.post(
                "/chat",
                json={"messages": [{"role": "user", "content": "Hi"}]},
                headers={"X-Session-Token": "test-session-token"},
            )

            assert response.status_code == 200
            assert "text/event-stream" in response.headers["content-type"]

            # Assert correct SSE payload generation including escaped newlines
            expected = "data: Hello\n\ndata: \\n\n\ndata: World\n\ndata: [DONE]\n\n"
            assert response.text == expected

    # Clean up dependency overrides
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_chat_endpoint_offline() -> None:
    # Inject MockLLMProvider into the server dependencies
    app.dependency_overrides[get_llm_provider] = lambda: MockLLMProvider()

    mock_db = MockDatabaseAdapter()
    # Simulate connection error
    mock_db._connection_error = Exception("Connection refused")  # type: ignore[attr-defined]

    # Patch server db_adapter and tool_dispatcher
    with (
        patch("copilot.server.db_adapter", mock_db),
        patch("copilot.server.tool_dispatcher._db", mock_db),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            response = await ac.post(
                "/chat",
                json={"messages": [{"role": "user", "content": "Hi"}]},
                headers={"X-Session-Token": "test-session-token"},
            )

            assert response.status_code == 200
            assert "text/event-stream" in response.headers["content-type"]

            # Assert correct SSE payload generation with offline message
            expected_msg = (
                "I've had a long day today... too tired to answer. Try again tomorrow!"
            )
            expected = f"data: {expected_msg}\n\ndata: [DONE]\n\n"
            assert response.text == expected

    # Clean up dependency overrides
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_feedback_endpoint() -> None:
    import json
    from unittest.mock import patch

    # Patch pathlib.Path to simulate a session log file
    mock_log_content = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hello, how can I help you?"},
    ]

    with (
        patch("pathlib.Path.exists", return_value=True),
        patch("pathlib.Path.read_text", return_value=json.dumps(mock_log_content)),
        patch("pathlib.Path.write_text") as mock_write_text,
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            response = await ac.post(
                "/chat/feedback",
                json={"content": "Hello, how can I help you?", "rating": "thumbs_up"},
                headers={"X-Session-Token": "test-session-token"},
            )

            assert response.status_code == 200
            assert response.json() == {"status": "success"}

            # Verify write_text was called with the updated rating
            written_args = mock_write_text.call_args[0][0]
            written_data = json.loads(written_args)
            assert written_data[1]["rating"] == "thumbs_up"


@pytest.mark.asyncio
async def test_feedback_endpoint_untoggle() -> None:
    import json
    from unittest.mock import patch

    # Patch pathlib.Path to simulate a session log file
    mock_log_content = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hello, how can I help you?", "rating": "thumbs_up"},
    ]

    with (
        patch("pathlib.Path.exists", return_value=True),
        patch("pathlib.Path.read_text", return_value=json.dumps(mock_log_content)),
        patch("pathlib.Path.write_text") as mock_write_text,
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            response = await ac.post(
                "/chat/feedback",
                json={"content": "Hello, how can I help you?", "rating": None},
                headers={"X-Session-Token": "test-session-token"},
            )

            assert response.status_code == 200
            assert response.json() == {"status": "success"}

            # Verify write_text was called with rating removed
            written_args = mock_write_text.call_args[0][0]
            written_data = json.loads(written_args)
            assert "rating" not in written_data[1]


@pytest.mark.asyncio
async def test_feedback_endpoint_not_found() -> None:
    from unittest.mock import patch

    with patch("pathlib.Path.exists", return_value=False):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            response = await ac.post(
                "/chat/feedback",
                json={"content": "Hello, how can I help you?", "rating": "thumbs_up"},
                headers={"X-Session-Token": "test-session-token"},
            )

            assert response.status_code == 200
            assert response.json() == {
                "status": "ignored",
                "reason": "Session log or message content not found",
            }


@pytest.mark.asyncio
async def test_jwe_session_decryption() -> None:
    from copilot.server import resolve_authenticated_user, settings
    from unittest.mock import patch

    mock_db = MockDatabaseAdapter()
    test_secret = "test-secret-12345678901234567890"

    # Token generated using exact NextAuth v5 encode library:
    # eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiYk9tb1l0MVl0dThjQkVQMzVPd3FHR0lwQjRfWEVoTjQxQUFqZ1VXZUVLM1N6dHlMV3R4cE1vcGRndDVoQS1maUlidzV6RjBpOUlZMUVoQWVBb1ExM2cifQ..pW3mOGQDki8woBjjbHkcTA.66CU7f6T7wmbeK9bPdkfk8oVD0a37UCn_WJ6St91GCmLB8F8_nsIF5-ya8ghW_gMGea54pmvaLCRd-M85uUedaKhGPvDBxsGVnN3wAP2eaymUTf8myAfvSHlEJYeho2YmYYbBVx_9_yxpeGZDnJh8Ib_-236lTytzHrHk2x6gDlt16GIX9WlayjdJvLcjHDk.21bqhtSmh-TgiOOxm6XDhWcqdHjs7YAX9X2CcJURkRQ
    test_token = (
        "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiYk9tb1l0MVl0dThjQkVQMzVPd3FHR0lwQjRfWEVoTjQxQUFqZ1VXZUVLM1N6dHlMV3R4cE1vcGRndDVoQS1maUlidzV6RjBpOUlZMUVoQWVBb1ExM2cifQ.."
        "c3hNwpLQMzEzPG2RTnGbtA.8kCMLWABkAuI8NqEqqaOzLgnMh5Lml2FE6NQYNsApImQU-LeteryHiErzoQYGlwwsmO4COJTnE7xr3AMvF1lpxSbgtCo3UkRUkPkeMB_g9z5qh9bxzX2Po83OlvnoMHNQLLIuA_1sm-spGxjhIZMdo6OVrS_96RzB16bM3bZSQg.lOhMEIBoO20GWrK4w9Hy3SOqO673rgHDZwmvDEJqiX4"
    )

    with patch("copilot.server.db_adapter", mock_db):
        object.__setattr__(settings, "auth_secret", test_secret)
        try:
            user = await resolve_authenticated_user(
                cookie_header=f"__Secure-authjs.session-token={test_token}"
            )
            assert user is not None
            assert user.email == "casco@lifia.info.unlp.edu.ar"
        finally:
            object.__setattr__(settings, "auth_secret", "")

