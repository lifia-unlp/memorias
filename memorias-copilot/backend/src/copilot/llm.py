import json
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any, Final, final, override

from openai import AsyncOpenAI, AsyncStream

from copilot.models import Message


class LLMProvider(ABC):
    @abstractmethod
    async def stream_completions(
        self,
        messages: list[Message],
        dispatcher: Any = None,
    ) -> AsyncIterator[str]:
        if False:
            yield ""


@final
class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, model: str) -> None:
        self._client: Final[AsyncOpenAI] = AsyncOpenAI(api_key=api_key)
        self._model: Final[str] = model

    @override
    async def stream_completions(
        self,
        messages: list[Message],
        dispatcher: Any = None,
    ) -> AsyncIterator[str]:
        from copilot.tools.definitions import TOOLS

        # Reconstruct standard completion history dictionary
        thread: list[dict[str, Any]] = [
            {"role": msg.role, "content": msg.content} for msg in messages
        ]

        while True:
            # Build API completions request kwargs
            kwargs: dict[str, Any] = {
                "model": self._model,
                "messages": thread,
                "stream": True,
            }
            if dispatcher is not None:
                kwargs["tools"] = TOOLS

            response = await self._client.chat.completions.create(**kwargs)

            if not isinstance(response, AsyncStream):
                raise TypeError("Expected an AsyncStream from OpenAI Completions API")

            tool_calls_acc: dict[int, dict[str, Any]] = {}
            content_acc: list[str] = []

            async for chunk in response:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta

                # Stream out raw text chunks immediately to client
                if delta.content is not None:
                    content_acc.append(delta.content)
                    yield delta.content

                # Accumulate tool calls chunks
                if delta.tool_calls:
                    for tc in delta.tool_calls:
                        idx = tc.index
                        if idx not in tool_calls_acc:
                            tool_calls_acc[idx] = {
                                "id": tc.id or "",
                                "name": tc.function.name if tc.function else "",
                                "arguments": [],
                            }
                        if tc.id and not tool_calls_acc[idx]["id"]:
                            tool_calls_acc[idx]["id"] = tc.id
                        if tc.function:
                            if tc.function.name:
                                tool_calls_acc[idx]["name"] = tc.function.name
                            if tc.function.arguments:
                                tool_calls_acc[idx]["arguments"].append(
                                    tc.function.arguments
                                )

            # If no tool calls were generated, the stream is finished!
            if not tool_calls_acc:
                break

            # Reconstruct complete tool calls
            openai_tool_calls = []
            for _, tc in sorted(tool_calls_acc.items()):
                args_str = "".join(tc["arguments"])
                openai_tool_calls.append(
                    {
                        "id": tc["id"],
                        "type": "function",
                        "function": {"name": tc["name"], "arguments": args_str},
                    }
                )

            # Append assistant tool calls request to conversation thread
            thread.append(
                {"role": "assistant", "content": None, "tool_calls": openai_tool_calls}
            )

            # Execute each tool and append the result message to thread
            for tc in openai_tool_calls:
                func_name = tc["function"]["name"]
                args_str = tc["function"]["arguments"]
                try:
                    args = json.loads(args_str) if args_str else {}
                except Exception as je:
                    args = {"error": f"Invalid JSON arguments: {je}"}

                tool_result = await dispatcher.dispatch(func_name, args)

                thread.append(
                    {
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "name": func_name,
                        "content": tool_result,
                    }
                )
