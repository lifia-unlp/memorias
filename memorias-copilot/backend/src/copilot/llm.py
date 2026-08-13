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
        user_info: Any = None,
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
        user_info: Any = None,
    ) -> AsyncIterator[str]:
        from copilot.tools.definitions import TOOLS

        if SYSTEM_PROMPT is None:
            raise RuntimeError("System prompt is not loaded. Chat is offline.")

        instructions = SYSTEM_PROMPT
        if user_info is not None:
            name_to_use = user_info.memberName or user_info.name or user_info.email
            user_context = (
                f"\n\nCURRENT USER CONTEXT:\n"
                f"- Authenticated User: Yes\n"
                f"- Name: {name_to_use}\n"
                f"- Email: {user_info.email}\n"
                f"- Role: {user_info.role}\n"
            )
            if user_info.memberSlug:
                user_context += f"- Linked Member Slug: {user_info.memberSlug}\n"
            user_context += (
                "Greet the user by their name if they greet you or ask who they are. "
                "You may assist them with their assigned follow-up items or lab activities."
            )
            instructions += user_context
        else:
            instructions += "\n\nCURRENT USER CONTEXT:\n- Authenticated User: No (Anonymous Visitor)\n"

        # Reconstruct history
        thread: list[dict[str, Any]] = []
        for msg in messages:
            if msg.role == "system":
                continue
            thread.append({"role": msg.role, "content": msg.content})

        tool_calls_count = 0
        history_end_index = len(thread)
        executed_calls_cache: set[str] = set()
        iterations = 0
        MAX_ITERATIONS = 10

        FOLLOWUP_TOOL_NAMES: Final[set[str]] = {
            "search_followup_items",
            "get_recent_followup_changes",
            "get_stale_followup_items",
            "get_member_followups",
        }

        while True:
            iterations += 1
            tools_list = []
            if dispatcher is not None and iterations <= MAX_ITERATIONS:
                for t in TOOLS:
                    if t.get("type") == "function" and "function" in t:
                        func_name = t["function"]["name"]
                        if user_info is None and func_name in FOLLOWUP_TOOL_NAMES:
                            continue

                        params = dict(t["function"].get("parameters", {}))
                        params["additionalProperties"] = False
                        tools_list.append(
                            {
                                "type": "function",
                                "name": func_name,
                                "description": t["function"].get("description", ""),
                                "parameters": params,
                                "strict": True,
                            }
                        )
                    else:
                        tools_list.append(t)
            if SKILLS_CONFIG and iterations <= MAX_ITERATIONS:
                filtered_skills = []
                for s in SKILLS_CONFIG:
                    # Filter out followup-tracking skill if user is not authenticated
                    if user_info is None and isinstance(s, dict):
                        env_skills = s.get("environment", {}).get("skills", [])
                        if any("followup" in str(sk.get("skill_id", "")) for sk in env_skills):
                            continue
                    filtered_skills.append(s)
                tools_list.extend(filtered_skills)

            kwargs: dict[str, Any] = {
                "model": self._model,
                "instructions": instructions,
                "input": thread,
                "stream": True,
            }
            if tools_list:
                kwargs["tools"] = tools_list

            response = await self._client.responses.create(**kwargs)

            if not isinstance(response, AsyncStream):
                raise TypeError("Expected an AsyncStream from OpenAI Responses API")

            tool_calls_acc: dict[str, dict[str, Any]] = {}
            content_acc: list[str] = []

            active_call_id: str | None = None
            async for event in response:
                if hasattr(event, "type"):
                    if event.type == "response.output_text.delta" and hasattr(event, "delta"):
                        content_acc.append(event.delta)
                        yield event.delta
                    elif event.type == "response.output_item.added" and hasattr(event, "item"):
                        item = event.item
                        if getattr(item, "type", None) == "function_call":
                            cid = getattr(item, "call_id", "") or ""
                            active_call_id = cid
                            tool_calls_acc[cid] = {
                                "id": cid,
                                "name": getattr(item, "name", ""),
                                "arguments": [getattr(item, "arguments", "")],
                            }
                    elif event.type == "response.function_call_arguments.delta" and hasattr(event, "delta"):
                        cid = getattr(event, "call_id", None) or active_call_id
                        if cid and cid in tool_calls_acc:
                            tool_calls_acc[cid]["arguments"].append(event.delta)

            if not tool_calls_acc or iterations > MAX_ITERATIONS:
                final_content = "".join(content_acc)
                if final_content:
                    thread.append({"role": "assistant", "content": final_content})
                break
            else:
                # If there were intermediate text chunks before a tool call, yield a double newline separator
                if content_acc:
                    sep = "\n\n"
                    yield sep
                    content_acc.append(sep)

            for _, tc in sorted(tool_calls_acc.items()):
                call_id = tc["id"]
                func_name = tc["name"]
                args_str = "".join(tc["arguments"])

                thread.append(
                    {
                        "type": "function_call",
                        "call_id": call_id,
                        "name": func_name,
                        "arguments": args_str,
                    }
                )

                call_signature = f"{func_name}:{args_str}"
                if call_signature in executed_calls_cache:
                    tool_result = json.dumps({
                        "info": "This query was already executed in this turn. Please synthesize a response with the information gathered so far."
                    })
                else:
                    executed_calls_cache.add(call_signature)
                    try:
                        args = json.loads(args_str) if args_str else {}
                    except Exception as je:
                        args = {"error": f"Invalid JSON arguments: {je}"}

                    tool_calls_count += 1
                    tool_result = await dispatcher.dispatch(
                        func_name, args, user_info=user_info
                    )

                thread.append(
                    {
                        "type": "function_call_output",
                        "call_id": call_id,
                        "output": tool_result if isinstance(tool_result, str) else json.dumps(tool_result, ensure_ascii=False),
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
