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
    ) -> AsyncIterator[str]:
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
