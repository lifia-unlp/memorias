import json
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from copilot.config import Settings
from copilot.db.adapter import PostgresDatabaseAdapter
from copilot.llm import LLMProvider, OpenAIProvider
from copilot.models import ChatRequest, SessionId
from copilot.session import InMemorySessionManager
from copilot.tools.dispatcher import ToolDispatcher

logger = logging.getLogger("uvicorn")
settings = Settings()

# Instantiate DatabaseAdapter and ToolDispatcher
db_adapter = PostgresDatabaseAdapter(dsn=settings.database_url)
tool_dispatcher = ToolDispatcher(db=db_adapter)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    logger.info("[Server] Initializing database connection pool...")
    try:
        await db_adapter.connect()
        logger.info("[Server] Database connection pool initialized successfully.")
    except Exception as e:
        logger.error(
            "DATABASE CONNECTION ERROR\n"
            "----------------------------------------------------------------------\n"
            f"Unable to connect to the database: {e}\n"
            "Please check:\n"
            f"  1. Is the database running on {settings.database_url}?\n"
            "  2. Is your DATABASE_URL in the .env file correct?\n"
            "  3. Do you have the required network access / SSH tunnel open?\n"
            "----------------------------------------------------------------------\n"
            "Running server in offline mode "
            "(friendly messages will be served to clients)."
        )
    try:
        yield
    finally:
        logger.info("[Server] Closing database connection pool...")
        await db_adapter.disconnect()


app = FastAPI(title="Memorias Copilot API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_manager = InMemorySessionManager(
    timeout_seconds=settings.session_timeout_seconds
)


def get_llm_provider() -> LLMProvider:
    return OpenAIProvider(api_key=settings.openai_api_key, model=settings.openai_model)


@app.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    x_session_token: str = Header(..., alias="X-Session-Token"),
    llm: LLMProvider = Depends(get_llm_provider),
) -> StreamingResponse:
    from copilot.llm import SYSTEM_PROMPT

    # Check if database is offline or system prompt is missing
    if (
        getattr(db_adapter, "_connection_error", None) is not None
        or SYSTEM_PROMPT is None
    ):

        async def offline_generator() -> AsyncIterator[str]:
            msg = (
                "I've had a long day today... too tired to answer. Try again tomorrow!"
            )
            escaped_msg = msg.replace("\n", "\\n").replace("\r", "\\r")
            yield f"data: {escaped_msg}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(offline_generator(), media_type="text/event-stream")

    session_id = SessionId(x_session_token)
    logger.info(
        f"[Server] Received POST /chat request. Session Token: {x_session_token}"
    )
    logger.info(f"[Server] Request Message Count: {len(request.messages)}")
    if request.messages:
        logger.info(f"[Server] Last message content: {request.messages[-1].content}")

    session = session_manager.get_or_create_session(session_id)
    session.set_messages(request.messages)

    async def event_generator() -> AsyncIterator[str]:
        try:
            chunk_count = 0
            async for chunk in llm.stream_completions(
                session.messages,
                dispatcher=tool_dispatcher,
                session_id=session_id.value,
            ):
                chunk_count += 1
                # Escape newlines and carriage returns so they don't break SSE framing
                escaped_chunk = chunk.replace("\n", "\\n").replace("\r", "\\r")
                yield f"data: {escaped_chunk}\n\n"
            logger.info(f"[Server] Streamed {chunk_count} chunks to client.")
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(
                f"[Server] Exception occurred during completions stream: {str(e)}"
            )
            # Send error in event-stream format
            yield f"data: _Error communicating with the Copilot: {str(e)}_\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


class FeedbackRequest(BaseModel):
    content: str
    rating: str | None  # "thumbs_up", "thumbs_down", or None


@app.post("/chat/feedback")
async def chat_feedback(
    request: FeedbackRequest,
    x_session_token: str = Header(..., alias="X-Session-Token"),
) -> dict[str, str]:
    try:
        logs_dir = Path(__file__).parent / ".." / ".." / "logs"
        log_file = logs_dir / f"session_{x_session_token}.json"

        if log_file.exists():
            file_content = log_file.read_text(encoding="utf-8")
            thread = json.loads(file_content)

            target_content = request.content.strip()
            found = False
            for msg in thread:
                if msg.get("role") == "assistant" and msg.get("content"):
                    if msg["content"].strip() == target_content:
                        if request.rating is None:
                            msg.pop("rating", None)
                        else:
                            msg["rating"] = request.rating
                        found = True
                        break

            if found:
                log_file.write_text(
                    json.dumps(thread, indent=2, ensure_ascii=False),
                    encoding="utf-8",
                )
                return {"status": "success"}

        return {
            "status": "ignored",
            "reason": "Session log or message content not found",
        }
    except Exception as e:
        return {"status": "error", "reason": str(e)}

