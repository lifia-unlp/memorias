import json
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, Final, final, override

from openai import AsyncOpenAI, AsyncStream

from copilot.models import Message


def _load_system_prompt() -> str | None:
    from datetime import date
    from copilot.config import Settings

    settings = Settings()
    base_url = settings.memorias_web_base_url.rstrip("/")
    current_date_str = date.today().isoformat()

    path = Path(__file__).parent / "prompts" / "system_prompt.md"
    try:
        raw_prompt = path.read_text(encoding="utf-8").strip()
        return (
            raw_prompt.replace("{base_url}", base_url)
            .replace("{lab_name}", settings.lab_name)
            .replace("{current_date}", current_date_str)
        )
    except Exception:
        return None


def _load_skills_config() -> list[dict[str, Any]]:
    path = Path(__file__).parent / "config" / "skills.json"
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        skill_refs = [
            {"type": "skill_reference", "skill_id": sid}
            for sid in data.values()
            if sid
        ]
        if not skill_refs:
            return []
        return [
            {
                "type": "shell",
                "environment": {
                    "type": "container_auto",
                    "skills": skill_refs,
                },
            }
        ]
    except Exception:
        return []


SYSTEM_PROMPT: Final[str | None] = _load_system_prompt()
SKILLS_CONFIG: Final[list[dict[str, Any]]] = _load_skills_config()


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

        # Reconstruct history
        thread: list[dict[str, Any]] = []
        for msg in messages:
            if msg.role == "system":
                continue
            thread.append({"role": msg.role, "content": msg.content})

        tool_calls_count = 0
        history_end_index = len(thread)

        while True:
            tools_list = []
            if dispatcher is not None:
                tools_list.extend(TOOLS)
            if SKILLS_CONFIG:
                tools_list.extend(SKILLS_CONFIG)

            kwargs: dict[str, Any] = {
                "model": self._model,
                "instructions": SYSTEM_PROMPT,
                "input": thread,
                "stream": True,
            }
            if tools_list:
                kwargs["tools"] = tools_list

            response = await self._client.responses.create(**kwargs)

            if not isinstance(response, AsyncStream):
                raise TypeError("Expected an AsyncStream from OpenAI Responses API")

            tool_calls_acc: dict[int, dict[str, Any]] = {}
            content_acc: list[str] = []

            async for event in response:
                if hasattr(event, "type"):
                    if event.type == "response.output_text.delta" and hasattr(event, "delta"):
                        content_acc.append(event.delta)
                        yield event.delta
                    elif event.type == "response.output_item.added" and hasattr(event, "item"):
                        item = event.item
                        if getattr(item, "type", None) == "function_call":
                            idx = getattr(item, "call_id", 0)
                            tool_calls_acc[idx] = {
                                "id": getattr(item, "call_id", ""),
                                "name": getattr(item, "name", ""),
                                "arguments": [getattr(item, "arguments", "")],
                            }

            if not tool_calls_acc:
                final_content = "".join(content_acc)
                if final_content:
                    thread.append({"role": "assistant", "content": final_content})
                break

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

            thread.append(
                {"role": "assistant", "content": None, "tool_calls": openai_tool_calls}
            )

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
                    existing_log: list[dict[str, Any]] = json.loads(
                        log_file.read_text(encoding="utf-8")
                    )
                    new_user_msg = {
                        "role": messages[-1].role,
                        "content": messages[-1].content,
                    }
                    existing_log.append(new_user_msg)
                    existing_log.extend(generated_this_turn)
                    existing_log.append(turn_metadata)
                    full_log = existing_log
                else:
                    full_log = list(thread)
                    full_log.append(turn_metadata)

                log_file.write_text(
                    json.dumps(full_log, indent=2, ensure_ascii=False),
                    encoding="utf-8",
                )
            except Exception:
                pass

        yield f"[GROUNDING:{level}:{tool_calls_count}]"
