from collections.abc import AsyncIterator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from copilot.llm import OpenAIProvider
from copilot.models import Message


@pytest.mark.asyncio
async def test_openai_provider_streaming() -> None:
    mock_client = MagicMock()
    mock_completions = AsyncMock()

    # Define mock response chunks
    mock_chunk_1 = MagicMock()
    mock_chunk_1.choices = [MagicMock()]
    mock_chunk_1.choices[0].delta.content = "Hello"

    mock_chunk_2 = MagicMock()
    mock_chunk_2.choices = [MagicMock()]
    mock_chunk_2.choices[0].delta.content = " world"

    from openai import AsyncStream

    mock_response = MagicMock(spec=AsyncStream)

    async def async_generator() -> AsyncIterator[MagicMock]:
        yield mock_chunk_1
        yield mock_chunk_2

    mock_response.__aiter__.side_effect = lambda: async_generator()

    mock_completions.create.return_value = mock_response
    mock_client.chat.completions = mock_completions

    # Patch AsyncOpenAI to return our mock client
    with patch("copilot.llm.AsyncOpenAI", return_value=mock_client):
        provider = OpenAIProvider(api_key="fake-key", model="fake-model")
        messages = [Message(role="user", content="Hi")]

        chunks = []
        async for chunk in provider.stream_completions(messages):
            chunks.append(chunk)

        from copilot.llm import SYSTEM_PROMPT

        assert chunks == ["Hello", " world"]
        mock_completions.create.assert_called_once_with(
            model="fake-model",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": "Hi"},
            ],
            stream=True,
        )
