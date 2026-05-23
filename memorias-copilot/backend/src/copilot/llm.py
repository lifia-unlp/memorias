import json
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, Final, final, override

from openai import AsyncOpenAI, AsyncStream

from copilot.models import Message


def _load_system_prompt() -> str | None:
    from copilot.config import Settings

    settings = Settings()
    base_url = settings.memorias_web_base_url.rstrip("/")

    path = Path(__file__).parent / "prompts" / "system_prompt.md"
    try:
        raw_prompt = path.read_text(encoding="utf-8").strip()
        return raw_prompt.replace("{base_url}", base_url)
    except Exception:
        return None


SYSTEM_PROMPT: Final[str | None] = _load_system_prompt()


class LLMProvider(ABC):
    @abstractmethod
    async def stream_completions(
        self,
        messages: list[Message],
        dispatcher: Any = None,
        session_id: str | None = None,
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
        session_id: str | None = None,
    ) -> AsyncIterator[str]:
        from copilot.tools.definitions import TOOLS

        if SYSTEM_PROMPT is None:
            raise RuntimeError("System prompt is not loaded. Chat is offline.")

        # Reconstruct history with prepended SYSTEM_PROMPT
        thread: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in messages:
            if msg.role == "system":
                continue
            thread.append({"role": msg.role, "content": msg.content})

        tool_calls_count = 0
        # Track where in the thread the history ends so we know which messages
        # were generated during this turn (tool calls, results, final reply).
        history_end_index = len(thread)

        while True:
            # Build API completions request kwargs
            kwargs: dict[str, Any] = {
                "model": self._model,
                "messages": list(thread),
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
                final_content = "".join(content_acc)
                if final_content:
                    thread.append({"role": "assistant", "content": final_content})
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

                tool_calls_count += 1
                tool_result = await dispatcher.dispatch(func_name, args)

                thread.append(
                    {
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "name": func_name,
                        "content": tool_result,
                    }
                )

        if tool_calls_count == 0:
            level = "none"
        elif tool_calls_count <= 2:
            level = "moderate"
        else:
            level = "strong"

        if session_id:
            try:
                # Only the messages appended during this turn
                # (tool calls, results, final reply).
                generated_this_turn = list(thread[history_end_index:])
                turn_metadata = {
                    "role": "metadata",
                    "grounding_level": level,
                    "tool_calls_count": tool_calls_count,
                }

                base_dir = Path(__file__).parent
                logs_dir = base_dir / ".." / ".." / "logs"
                logs_dir.mkdir(parents=True, exist_ok=True)
                log_file = logs_dir / f"session_{session_id}.json"

                if log_file.exists():
                    # Append mode: preserve prior turns exactly as they happened.
                    existing_log: list[dict[str, Any]] = json.loads(
                        log_file.read_text(encoding="utf-8")
                    )
                    # The new user message is the last message in the incoming history.
                    new_user_msg = {
                        "role": messages[-1].role,
                        "content": messages[-1].content,
                    }
                    existing_log.append(new_user_msg)
                    existing_log.extend(generated_this_turn)
                    existing_log.append(turn_metadata)
                    full_log = existing_log
                else:
                    # First turn: write the full initial thread plus generated messages.
                    full_log = list(thread)
                    full_log.append(turn_metadata)

                log_file.write_text(
                    json.dumps(full_log, indent=2, ensure_ascii=False),
                    encoding="utf-8",
                )
            except Exception:
                pass

        yield f"[GROUNDING:{level}:{tool_calls_count}]"
