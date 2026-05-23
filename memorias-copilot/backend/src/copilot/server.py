import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

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
    await db_adapter.connect()
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
                session.messages, dispatcher=tool_dispatcher
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
