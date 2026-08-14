# Make sure the db is up and running locally in port 5432
uv run uvicorn --app-dir src copilot.server:app --reload --port 8000
