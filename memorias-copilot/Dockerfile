# ── Stage 1: dependency installation ────────────────────────────────────────
# Use the official uv image as the installer so we don't ship uv itself.
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app

# Copy lockfile and project manifest first for layer caching.
COPY backend/pyproject.toml backend/uv.lock ./

# Install production dependencies into /app/.venv without dev extras.
RUN uv sync --frozen --no-dev

# ── Stage 2: runtime image ───────────────────────────────────────────────────
FROM python:3.12-slim-bookworm AS runtime

WORKDIR /app

# Copy the virtual environment built in stage 1.
COPY --from=builder /app/.venv /app/.venv

# Copy application source.
COPY backend/src ./src

# Copy the static frontend files.
COPY frontend ./frontend

# Create a directory for session logs (can be bind-mounted for persistence).
RUN mkdir -p /app/logs

# Tell server.py where the frontend lives.
ENV FRONTEND_DIR=/app/frontend

# Activate the venv for all subsequent commands.
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app/src"

# Expose the default uvicorn port.
EXPOSE 8000

CMD ["uvicorn", "copilot.server:app", "--host", "0.0.0.0", "--port", "8000"]
