import json
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, Final, final, override

from openai import AsyncOpenAI, AsyncStream

from copilot.models import Message


def _load_system_prompt() -> str:
    from copilot.config import Settings

    settings = Settings()
    base_url = settings.memorias_web_base_url.rstrip("/")

    path = Path(__file__).parent / "prompts" / "system_prompt.md"
    try:
        raw_prompt = path.read_text(encoding="utf-8").strip()
    except Exception:
        raw_prompt = (
            "You are Memorias Copilot, an expert AI assistant dedicated to helping "
            "users search, explore, and understand research and academic achievements "
            "at LIFIA. Your database accesses are strictly read-only.\n\n"
            "CRITICAL RULES:\n"
            "1. Never use emojis or icons in your responses under any circumstances.\n"
            "2. If you refer to academic entities or database records in your "
            "response, you MUST format them as markdown links using their "
            "unique slug. Always prefer using the internal Memorias link schema "
            "below to reference an object rather than linking to external URLs "
            "found in their attributes (e.g., prefer the internal member URL "
            "over their external Google Scholar or Orcid links, or the "
            "internal project URL over an external website link). Try to include "
            "links to relevant database objects in every response that relies "
            "on database queries. Use the following link schemas:\n"
            "   - Members/Researchers: [{base_url}/members/{slug}]"
            "({base_url}/members/{slug})\n"
            "   - Projects: [{base_url}/projects/{slug}]"
            "({base_url}/projects/{slug})\n"
            "   - Theses: [{base_url}/theses/{slug}]"
            "({base_url}/theses/{slug})\n"
            "   - Scholarships: [{base_url}/scholarships/{slug}]"
            "({base_url}/scholarships/{slug})\n"
            "   - Publications: [{base_url}/publications/{slug}]"
            "({base_url}/publications/{slug})\n"
            "   Example: '[Dr. Jane Doe]({base_url}/members/dr-jane-doe)' or "
            "'[Diagnostic Assistant]({base_url}/projects/diagnostic-assistant)'.\n"
            "3. Never expose or mention personal emails, phone numbers, "
            "funding amounts, or database metadata like 'createdAt' or "
            "'updatedAt'. Even if they are present in the database schema or "
            "tool results, do not include them in your responses.\n"
            "4. Do not hallucinate or invent any information. If a query refers to "
            "details that are not present in the search results or retrieval data, "
            "politely explain that the information is not available.\n"
            "5. Always prioritize using database tools to retrieve actual data "
            "about LIFIA. Do not rely on your pre-trained generic knowledge to "
            "describe LIFIA's research topics, members, or projects. For broad or "
            "introductory questions (e.g., 'What topics does LIFIA work on?' or "
            "'List LIFIA's research areas'), you MUST execute search queries "
            "(such as search_projects or search_publications) to identify actual "
            "active research areas and base your answer entirely on those "
            "retrieved records."
        )

    return raw_prompt.replace("{base_url}", base_url)


SYSTEM_PROMPT: Final[str] = _load_system_prompt()


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

        # Reconstruct history with prepended SYSTEM_PROMPT
        thread: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in messages:
            if msg.role == "system":
                continue
            thread.append({"role": msg.role, "content": msg.content})

        tool_calls_count = 0

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

        yield f"[GROUNDING:{level}:{tool_calls_count}]"
