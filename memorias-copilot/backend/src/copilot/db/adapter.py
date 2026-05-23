from abc import ABC, abstractmethod
from typing import Final, final, override

import asyncpg

from copilot.models import Member, Project, Publication, Scholarship, Thesis


class DatabaseAdapter(ABC):
    @abstractmethod
    async def connect(self) -> None:
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        pass

    # --- Search Methods ---
    @abstractmethod
    async def search_members(self, query: str) -> list[Member]:
        pass

    @abstractmethod
    async def search_projects(self, query: str) -> list[Project]:
        pass

    @abstractmethod
    async def search_theses(self, query: str) -> list[Thesis]:
        pass

    @abstractmethod
    async def search_scholarships(self, query: str) -> list[Scholarship]:
        pass

    @abstractmethod
    async def search_publications(self, query: str) -> list[Publication]:
        pass

    # --- Detail Retrieval Methods ---
    @abstractmethod
    async def get_member_by_id_or_slug(self, id_or_slug: str) -> Member | None:
        pass

    @abstractmethod
    async def get_project_by_id_or_slug(self, id_or_slug: str) -> Project | None:
        pass

    @abstractmethod
    async def get_thesis_by_id_or_slug(self, id_or_slug: str) -> Thesis | None:
        pass

    @abstractmethod
    async def get_scholarship_by_id_or_slug(
        self, id_or_slug: str
    ) -> Scholarship | None:
        pass

    @abstractmethod
    async def get_publication_by_id_or_slug(
        self, id_or_slug: str
    ) -> Publication | None:
        pass

    # --- Relation Traversal Methods ---
    @abstractmethod
    async def get_project_members(self, project_id: str) -> list[Member]:
        pass

    @abstractmethod
    async def get_member_projects(self, member_id: str) -> list[Project]:
        pass

    @abstractmethod
    async def get_member_publications(self, member_id: str) -> list[Publication]:
        pass

    @abstractmethod
    async def get_member_theses(self, member_id: str) -> list[Thesis]:
        pass

    @abstractmethod
    async def get_member_scholarships(self, member_id: str) -> list[Scholarship]:
        pass

    @abstractmethod
    async def get_project_publications(self, project_id: str) -> list[Publication]:
        pass

    @abstractmethod
    async def get_thesis_publications(self, thesis_id: str) -> list[Publication]:
        pass


@final
class PostgresDatabaseAdapter(DatabaseAdapter):
    def __init__(self, dsn: str) -> None:
        self._dsn: Final[str] = dsn
        self._pool: asyncpg.Pool | None = None

    @override
    async def connect(self) -> None:
        if self._pool is None:
            self._pool = await asyncpg.create_pool(self._dsn, ssl=False)

    @override
    async def disconnect(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

    def _get_pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise RuntimeError(
                "DatabaseAdapter is not connected. Call connect() first."
            )
        return self._pool

    # --- Search Methods ---
    @override
    async def search_members(self, query: str) -> list[Member]:
        pool = self._get_pool()
        sql = """
            SELECT * FROM "Member"
            WHERE "firstName" ILIKE $1
               OR "lastName" ILIKE $1
               OR "slug" ILIKE $1
               OR "positionAtLab" ILIKE $1
               OR "shortCvInSpanish" ILIKE $1
               OR "shortCvInEnglish" ILIKE $1
               OR "interestsInSpanish" ILIKE $1
               OR "interestsInEnglish" ILIKE $1
            ORDER BY "lastName" ASC, "firstName" ASC
            LIMIT 50
        """
        records = await pool.fetch(sql, f"%{query}%")
        return [Member(**dict(r)) for r in records]

    @override
    async def search_projects(self, query: str) -> list[Project]:
        pool = self._get_pool()
        sql = """
            SELECT * FROM "Project"
            WHERE "title" ILIKE $1
               OR "code" ILIKE $1
               OR "summary" ILIKE $1
               OR "slug" ILIKE $1
            ORDER BY "startDate" DESC NULLS LAST
            LIMIT 50
        """
        records = await pool.fetch(sql, f"%{query}%")
        return [Project(**dict(r)) for r in records]

    @override
    async def search_theses(self, query: str) -> list[Thesis]:
        pool = self._get_pool()
        sql = """
            SELECT * FROM "Thesis"
            WHERE "title" ILIKE $1
               OR "career" ILIKE $1
               OR "student" ILIKE $1
               OR "director" ILIKE $1
               OR "coDirector" ILIKE $1
               OR "summary" ILIKE $1
            ORDER BY "startDate" DESC NULLS LAST
            LIMIT 50
        """
        records = await pool.fetch(sql, f"%{query}%")
        return [Thesis(**dict(r)) for r in records]

    @override
    async def search_scholarships(self, query: str) -> list[Scholarship]:
        pool = self._get_pool()
        sql = """
            SELECT * FROM "Scholarship"
            WHERE "title" ILIKE $1
               OR "type" ILIKE $1
               OR "student" ILIKE $1
               OR "director" ILIKE $1
               OR "coDirector" ILIKE $1
               OR "summary" ILIKE $1
            ORDER BY "startDate" DESC NULLS LAST
            LIMIT 50
        """
        records = await pool.fetch(sql, f"%{query}%")
        return [Scholarship(**dict(r)) for r in records]

    @override
    async def search_publications(self, query: str) -> list[Publication]:
        pool = self._get_pool()
        sql = """
            SELECT * FROM "Publication"
            WHERE "title" ILIKE $1
               OR "authors" ILIKE $1
               OR "type" ILIKE $1
               OR "ranking" ILIKE $1
               OR "year"::text ILIKE $1
            ORDER BY "year" DESC
            LIMIT 50
        """
        records = await pool.fetch(sql, f"%{query}%")
        return [Publication(**dict(r)) for r in records]

    # --- Detail Retrieval Methods ---
    @override
    async def get_member_by_id_or_slug(self, id_or_slug: str) -> Member | None:
        pool = self._get_pool()
        sql = 'SELECT * FROM "Member" WHERE "id" = $1 OR "slug" = $1'
        r = await pool.fetchrow(sql, id_or_slug)
        return Member(**dict(r)) if r else None

    @override
    async def get_project_by_id_or_slug(self, id_or_slug: str) -> Project | None:
        pool = self._get_pool()
        sql = 'SELECT * FROM "Project" WHERE "id" = $1 OR "slug" = $1'
        r = await pool.fetchrow(sql, id_or_slug)
        return Project(**dict(r)) if r else None

    @override
    async def get_thesis_by_id_or_slug(self, id_or_slug: str) -> Thesis | None:
        pool = self._get_pool()
        sql = 'SELECT * FROM "Thesis" WHERE "id" = $1 OR "slug" = $1'
        r = await pool.fetchrow(sql, id_or_slug)
        return Thesis(**dict(r)) if r else None

    @override
    async def get_scholarship_by_id_or_slug(
        self, id_or_slug: str
    ) -> Scholarship | None:
        pool = self._get_pool()
        sql = 'SELECT * FROM "Scholarship" WHERE "id" = $1 OR "slug" = $1'
        r = await pool.fetchrow(sql, id_or_slug)
        return Scholarship(**dict(r)) if r else None

    @override
    async def get_publication_by_id_or_slug(
        self, id_or_slug: str
    ) -> Publication | None:
        pool = self._get_pool()
        sql = 'SELECT * FROM "Publication" WHERE "id" = $1 OR "slug" = $1'
        r = await pool.fetchrow(sql, id_or_slug)
        return Publication(**dict(r)) if r else None

    # --- Relation Traversal Methods ---
    @override
    async def get_project_members(self, project_id: str) -> list[Member]:
        pool = self._get_pool()
        sql = """
            SELECT m.* FROM "Member" m
            JOIN "_ProjectMembers" pm ON pm."A" = m.id
            WHERE pm."B" = $1
            ORDER BY m."lastName" ASC, m."firstName" ASC
        """
        records = await pool.fetch(sql, project_id)
        return [Member(**dict(r)) for r in records]

    @override
    async def get_member_projects(self, member_id: str) -> list[Project]:
        pool = self._get_pool()
        sql = """
            SELECT p.* FROM "Project" p
            JOIN "_ProjectMembers" pm ON pm."B" = p.id
            WHERE pm."A" = $1
            ORDER BY p."startDate" DESC NULLS LAST
        """
        records = await pool.fetch(sql, member_id)
        return [Project(**dict(r)) for r in records]

    @override
    async def get_member_publications(self, member_id: str) -> list[Publication]:
        pool = self._get_pool()
        sql = """
            SELECT p.* FROM "Publication" p
            JOIN "_PublicationMembers" pm ON pm."B" = p.id
            WHERE pm."A" = $1
            ORDER BY p."year" DESC
        """
        records = await pool.fetch(sql, member_id)
        return [Publication(**dict(r)) for r in records]

    @override
    async def get_member_theses(self, member_id: str) -> list[Thesis]:
        pool = self._get_pool()
        sql = """
            SELECT t.* FROM "Thesis" t
            JOIN "_ThesisMembers" tm ON tm."B" = t.id
            WHERE tm."A" = $1
            ORDER BY t."startDate" DESC NULLS LAST
        """
        records = await pool.fetch(sql, member_id)
        return [Thesis(**dict(r)) for r in records]

    @override
    async def get_member_scholarships(self, member_id: str) -> list[Scholarship]:
        pool = self._get_pool()
        sql = """
            SELECT s.* FROM "Scholarship" s
            JOIN "_ScholarshipMembers" sm ON sm."B" = s.id
            WHERE sm."A" = $1
            ORDER BY s."startDate" DESC NULLS LAST
        """
        records = await pool.fetch(sql, member_id)
        return [Scholarship(**dict(r)) for r in records]

    @override
    async def get_project_publications(self, project_id: str) -> list[Publication]:
        pool = self._get_pool()
        sql = """
            SELECT p.* FROM "Publication" p
            JOIN "_ProjectPublications" pp ON pp."B" = p.id
            WHERE pp."A" = $1
            ORDER BY p."year" DESC
        """
        records = await pool.fetch(sql, project_id)
        return [Publication(**dict(r)) for r in records]

    @override
    async def get_thesis_publications(self, thesis_id: str) -> list[Publication]:
        pool = self._get_pool()
        sql = """
            SELECT p.* FROM "Publication" p
            JOIN "_ThesisPublications" tp ON tp."A" = p.id
            WHERE tp."B" = $1
            ORDER BY p."year" DESC
        """
        records = await pool.fetch(sql, thesis_id)
        return [Publication(**dict(r)) for r in records]
