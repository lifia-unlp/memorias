from collections.abc import AsyncIterator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from copilot.llm import OpenAIProvider
from copilot.models import Message


@pytest.mark.asyncio
async def test_openai_provider_streaming() -> None:
    mock_client = MagicMock()
    mock_responses = AsyncMock()

    # Define mock response events from Responses API
    mock_event_1 = MagicMock()
    mock_event_1.type = "response.output_text.delta"
    mock_event_1.delta = "Hello"

    mock_event_2 = MagicMock()
    mock_event_2.type = "response.output_text.delta"
    mock_event_2.delta = " world"

    from openai import AsyncStream

    mock_response = MagicMock(spec=AsyncStream)

    async def async_generator() -> AsyncIterator[MagicMock]:
        yield mock_event_1
        yield mock_event_2

    mock_response.__aiter__.side_effect = lambda: async_generator()

    mock_responses.create.return_value = mock_response
    mock_client.responses = mock_responses

    # Patch AsyncOpenAI to return our mock client
    with patch("copilot.llm.AsyncOpenAI", return_value=mock_client):
        provider = OpenAIProvider(api_key="fake-key", model="fake-model")
        messages = [Message(role="user", content="Hi")]

        chunks = []
        async for chunk in provider.stream_completions(messages):
            chunks.append(chunk)

        from copilot.llm import SYSTEM_PROMPT, SKILLS_CONFIG

        assert SYSTEM_PROMPT is not None
        assert chunks == ["Hello", " world", "[GROUNDING:none:0]"]

        expected_instructions = SYSTEM_PROMPT + "\n\nCURRENT USER CONTEXT:\n- Authenticated User: No (Anonymous Visitor)\n"

        expected_kwargs = {
            "model": "fake-model",
            "instructions": expected_instructions,
            "input": [{"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hello world"}],
            "stream": True,
        }
        if SKILLS_CONFIG:
            expected_kwargs["tools"] = SKILLS_CONFIG

        mock_responses.create.assert_called_once_with(**expected_kwargs)
