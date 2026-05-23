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


@pytest.mark.asyncio
async def test_model_serialization_exclusions() -> None:
    db = MockDatabaseAdapter()
    await db.connect()
    dispatcher = ToolDispatcher(db=db)

    # Member exclusions
    member_json = await dispatcher.dispatch(
        "get_member_by_id_or_slug", {"id_or_slug": "dr-jane-doe"}
    )
    member = json.loads(member_json)
    assert "personalEmail" not in member
    assert "phone" not in member
    assert "notes" not in member
    assert "createdAt" not in member
    assert "updatedAt" not in member

    # Project exclusions
    projects_json = await dispatcher.dispatch(
        "search_projects", {"query": "Diagnostic"}
    )
    projects = json.loads(projects_json)
    assert len(projects) == 1
    project = projects[0]
    assert "amount" not in project
    assert "createdAt" not in project
    assert "updatedAt" not in project

    # Thesis exclusions
    theses_json = await dispatcher.dispatch("search_theses", {"query": "AI"})
    theses = json.loads(theses_json)
    assert len(theses) == 1
    thesis = theses[0]
    assert "createdAt" not in thesis
    assert "updatedAt" not in thesis

    # Scholarship exclusions
    scholarships_json = await dispatcher.dispatch(
        "search_scholarships", {"query": "CONICET"}
    )
    scholarships = json.loads(scholarships_json)
    assert len(scholarships) == 1
    scholarship = scholarships[0]
    assert "createdAt" not in scholarship
    assert "updatedAt" not in scholarship

    # Publication exclusions
    publications_json = await dispatcher.dispatch(
        "search_publications", {"query": "Deep"}
    )
    publications = json.loads(publications_json)
    assert len(publications) == 1
    publication = publications[0]
    assert "createdAt" not in publication
    assert "updatedAt" not in publication
