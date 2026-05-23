import json

import pytest

from copilot.tools.dispatcher import ToolDispatcher
from tests.test_db import MockDatabaseAdapter


@pytest.mark.asyncio
async def test_tool_dispatcher_search() -> None:
    db = MockDatabaseAdapter()
    await db.connect()
    dispatcher = ToolDispatcher(db=db)

    # Test search_members dispatching
    members_json = await dispatcher.dispatch("search_members", {"query": "Jane"})
    members = json.loads(members_json)
    assert len(members) == 1
    assert members[0]["firstName"] == "Jane"

    # Test search_projects dispatching
    projects_json = await dispatcher.dispatch(
        "search_projects", {"query": "Diagnostic"}
    )
    projects = json.loads(projects_json)
    assert len(projects) == 1
    assert projects[0]["title"] == "Diagnostic Assistant"

    # Test detail retrieval dispatching
    member_json = await dispatcher.dispatch(
        "get_member_by_id_or_slug", {"id_or_slug": "dr-jane-doe"}
    )
    member = json.loads(member_json)
    assert member["slug"] == "dr-jane-doe"

    # Test invalid tool name
    error_json = await dispatcher.dispatch("non_existent_tool", {})
    error = json.loads(error_json)
    assert "error" in error
