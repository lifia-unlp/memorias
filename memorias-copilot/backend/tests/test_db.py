from datetime import datetime
from typing import override

import pytest

from copilot.db.adapter import DatabaseAdapter
from copilot.models import Member, Project, Publication, Scholarship, Thesis


class MockDatabaseAdapter(DatabaseAdapter):
    def __init__(self) -> None:
        self.connected = False

    @override
    async def connect(self) -> None:
        self.connected = True

    @override
    async def disconnect(self) -> None:
        self.connected = False

    @override
    async def search_members(self, query: str) -> list[Member]:
        return [
            Member(
                id="member-1",
                firstName="Jane",
                lastName="Doe",
                slug="dr-jane-doe",
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )
        ]

    @override
    async def search_projects(self, query: str) -> list[Project]:
        return [
            Project(
                id="project-1",
                title="Diagnostic Assistant",
                slug="diagnostic-assistant",
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )
        ]

    @override
    async def search_theses(self, query: str) -> list[Thesis]:
        return [
            Thesis(
                id="thesis-1",
                title="AI in Imaging",
                slug="ai-imaging",
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )
        ]

    @override
    async def search_scholarships(self, query: str) -> list[Scholarship]:
        return [
            Scholarship(
                id="scholarship-1",
                title="CONICET Fellowship",
                slug="conicet-fellowship",
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )
        ]

    @override
    async def search_publications(self, query: str) -> list[Publication]:
        return [
            Publication(
                id="pub-1",
                slug="deep-learning-review",
                type="article",
                title="Deep Learning Review",
                authors="Jane Doe, John Smith",
                year=2023,
                bibtexData={"journal": "Medical Image Analysis"},
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )
        ]

    @override
    async def get_member_by_id_or_slug(self, id_or_slug: str) -> Member | None:
        if id_or_slug in ("member-1", "dr-jane-doe"):
            return Member(
                id="member-1",
                firstName="Jane",
                lastName="Doe",
                slug="dr-jane-doe",
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )
        return None

    @override
    async def get_project_by_id_or_slug(self, id_or_slug: str) -> Project | None:
        if id_or_slug in ("project-1", "diagnostic-assistant"):
            return Project(
                id="project-1",
                title="Diagnostic Assistant",
                slug="diagnostic-assistant",
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )
        return None

    @override
    async def get_thesis_by_id_or_slug(self, id_or_slug: str) -> Thesis | None:
        return None

    @override
    async def get_scholarship_by_id_or_slug(
        self, id_or_slug: str
    ) -> Scholarship | None:
        return None

    @override
    async def get_publication_by_id_or_slug(
        self, id_or_slug: str
    ) -> Publication | None:
        return None

    @override
    async def get_project_members(self, project_id: str) -> list[Member]:
        return []

    @override
    async def get_member_projects(self, member_id: str) -> list[Project]:
        return []

    @override
    async def get_member_publications(self, member_id: str) -> list[Publication]:
        return []

    @override
    async def get_member_theses(self, member_id: str) -> list[Thesis]:
        return []

    @override
    async def get_member_scholarships(self, member_id: str) -> list[Scholarship]:
        return []

    @override
    async def get_project_publications(self, project_id: str) -> list[Publication]:
        return []

    @override
    async def get_tag_cloud(self) -> dict[str, int]:
        return {"hic": 5, "ux": 3, "semantic-web": 1}

    @override
    async def get_all_members(self) -> list[Member]:
        return [
            Member(
                id="member-1",
                firstName="Jane",
                lastName="Doe",
                slug="dr-jane-doe",
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )
        ]

    @override
    async def get_thesis_publications(self, thesis_id: str) -> list[Publication]:
        return []




@pytest.mark.asyncio
async def test_mock_database_adapter() -> None:
    db = MockDatabaseAdapter()
    await db.connect()
    assert db.connected is True

    members = await db.search_members("Jane")
    assert len(members) == 1
    assert members[0].firstName == "Jane"

    member = await db.get_member_by_id_or_slug("dr-jane-doe")
    assert member is not None
    assert member.lastName == "Doe"

    await db.disconnect()
    assert db.connected is False
