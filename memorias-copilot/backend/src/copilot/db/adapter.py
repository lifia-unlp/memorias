from abc import ABC, abstractmethod
from typing import Any, Final, final, override

from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

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
        self._pool: AsyncConnectionPool | None = None
        self._connection_error: Exception | None = None

    @override
    async def connect(self) -> None:
        if self._pool is None:
            try:
                self._pool = AsyncConnectionPool(
                    self._dsn,
                    open=False,
                    kwargs={"row_factory": dict_row},
                )
                await self._pool.open()
                self._connection_error = None
            except Exception as e:
                self._connection_error = e
                if self._pool is not None:
                    await self._pool.close()
                    self._pool = None
                raise e

    @override
    async def disconnect(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None
            self._connection_error = None

    def _get_pool(self) -> AsyncConnectionPool:
        if self._pool is None:
            raise RuntimeError(
                "DatabaseAdapter is not connected. Call connect() first."
            )
        return self._pool

    async def _fetch(self, sql: str, params: Any = None) -> list[dict[str, Any]]:
        pool = self._get_pool()
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(sql, params)
                return await cur.fetchall()  # type: ignore[return-value]

    async def _fetchrow(self, sql: str, params: Any = None) -> dict[str, Any] | None:
        pool = self._get_pool()
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(sql, params)
                return await cur.fetchone()  # type: ignore[return-value]

    # --- Search Methods ---
    @override
    async def search_members(self, query: str) -> list[Member]:
        sql = """
            SELECT * FROM "Member"
            WHERE "firstName" ILIKE %(q)s
               OR "lastName" ILIKE %(q)s
               OR "slug" ILIKE %(q)s
               OR "positionAtLab" ILIKE %(q)s
               OR "shortCvInSpanish" ILIKE %(q)s
               OR "shortCvInEnglish" ILIKE %(q)s
               OR "interestsInSpanish" ILIKE %(q)s
               OR "interestsInEnglish" ILIKE %(q)s
            ORDER BY "lastName" ASC, "firstName" ASC
            LIMIT 50
        """
        records = await self._fetch(sql, {"q": f"%{query}%"})
        return [Member(**r) for r in records]

    @override
    async def search_projects(self, query: str) -> list[Project]:
        sql = """
            SELECT * FROM "Project"
            WHERE "title" ILIKE %(q)s
               OR "code" ILIKE %(q)s
               OR "summary" ILIKE %(q)s
               OR "slug" ILIKE %(q)s
            ORDER BY "startDate" DESC NULLS LAST
            LIMIT 50
        """
        records = await self._fetch(sql, {"q": f"%{query}%"})
        return [Project(**r) for r in records]

    @override
    async def search_theses(self, query: str) -> list[Thesis]:
        sql = """
            SELECT * FROM "Thesis"
            WHERE "title" ILIKE %(q)s
               OR "career" ILIKE %(q)s
               OR "student" ILIKE %(q)s
               OR "director" ILIKE %(q)s
               OR "coDirector" ILIKE %(q)s
               OR "summary" ILIKE %(q)s
            ORDER BY "startDate" DESC NULLS LAST
            LIMIT 50
        """
        records = await self._fetch(sql, {"q": f"%{query}%"})
        return [Thesis(**r) for r in records]

    @override
    async def search_scholarships(self, query: str) -> list[Scholarship]:
        sql = """
            SELECT * FROM "Scholarship"
            WHERE "title" ILIKE %(q)s
               OR "type" ILIKE %(q)s
               OR "student" ILIKE %(q)s
               OR "director" ILIKE %(q)s
               OR "coDirector" ILIKE %(q)s
               OR "summary" ILIKE %(q)s
            ORDER BY "startDate" DESC NULLS LAST
            LIMIT 50
        """
        records = await self._fetch(sql, {"q": f"%{query}%"})
        return [Scholarship(**r) for r in records]

    @override
    async def search_publications(self, query: str) -> list[Publication]:
        sql = """
            SELECT * FROM "Publication"
            WHERE "title" ILIKE %(q)s
               OR "authors" ILIKE %(q)s
               OR "type" ILIKE %(q)s
               OR "ranking" ILIKE %(q)s
               OR "year"::text ILIKE %(q)s
            ORDER BY "year" DESC
            LIMIT 50
        """
        records = await self._fetch(sql, {"q": f"%{query}%"})
        return [Publication(**r) for r in records]

    # --- Detail Retrieval Methods ---
    @override
    async def get_member_by_id_or_slug(self, id_or_slug: str) -> Member | None:
        sql = 'SELECT * FROM "Member" WHERE "id" = %s OR "slug" = %s'
        r = await self._fetchrow(sql, (id_or_slug, id_or_slug))
        return Member(**r) if r else None

    @override
    async def get_project_by_id_or_slug(self, id_or_slug: str) -> Project | None:
        sql = 'SELECT * FROM "Project" WHERE "id" = %s OR "slug" = %s'
        r = await self._fetchrow(sql, (id_or_slug, id_or_slug))
        return Project(**r) if r else None

    @override
    async def get_thesis_by_id_or_slug(self, id_or_slug: str) -> Thesis | None:
        sql = 'SELECT * FROM "Thesis" WHERE "id" = %s OR "slug" = %s'
        r = await self._fetchrow(sql, (id_or_slug, id_or_slug))
        return Thesis(**r) if r else None

    @override
    async def get_scholarship_by_id_or_slug(
        self, id_or_slug: str
    ) -> Scholarship | None:
        sql = 'SELECT * FROM "Scholarship" WHERE "id" = %s OR "slug" = %s'
        r = await self._fetchrow(sql, (id_or_slug, id_or_slug))
        return Scholarship(**r) if r else None

    @override
    async def get_publication_by_id_or_slug(
        self, id_or_slug: str
    ) -> Publication | None:
        sql = 'SELECT * FROM "Publication" WHERE "id" = %s OR "slug" = %s'
        r = await self._fetchrow(sql, (id_or_slug, id_or_slug))
        return Publication(**r) if r else None

    # --- Relation Traversal Methods ---
    @override
    async def get_project_members(self, project_id: str) -> list[Member]:
        sql = """
            SELECT m.* FROM "Member" m
            JOIN "_ProjectMembers" pm ON pm."A" = m.id
            WHERE pm."B" = %s
            ORDER BY m."lastName" ASC, m."firstName" ASC
        """
        records = await self._fetch(sql, (project_id,))
        return [Member(**r) for r in records]

    @override
    async def get_member_projects(self, member_id: str) -> list[Project]:
        sql = """
            SELECT p.* FROM "Project" p
            JOIN "_ProjectMembers" pm ON pm."B" = p.id
            WHERE pm."A" = %s
            ORDER BY p."startDate" DESC NULLS LAST
        """
        records = await self._fetch(sql, (member_id,))
        return [Project(**r) for r in records]

    @override
    async def get_member_publications(self, member_id: str) -> list[Publication]:
        sql = """
            SELECT p.* FROM "Publication" p
            JOIN "_PublicationMembers" pm ON pm."B" = p.id
            WHERE pm."A" = %s
            ORDER BY p."year" DESC
        """
        records = await self._fetch(sql, (member_id,))
        return [Publication(**r) for r in records]

    @override
    async def get_member_theses(self, member_id: str) -> list[Thesis]:
        sql = """
            SELECT t.* FROM "Thesis" t
            JOIN "_ThesisMembers" tm ON tm."B" = t.id
            WHERE tm."A" = %s
            ORDER BY t."startDate" DESC NULLS LAST
        """
        records = await self._fetch(sql, (member_id,))
        return [Thesis(**r) for r in records]

    @override
    async def get_member_scholarships(self, member_id: str) -> list[Scholarship]:
        sql = """
            SELECT s.* FROM "Scholarship" s
            JOIN "_ScholarshipMembers" sm ON sm."B" = s.id
            WHERE sm."A" = %s
            ORDER BY s."startDate" DESC NULLS LAST
        """
        records = await self._fetch(sql, (member_id,))
        return [Scholarship(**r) for r in records]

    @override
    async def get_project_publications(self, project_id: str) -> list[Publication]:
        sql = """
            SELECT p.* FROM "Publication" p
            JOIN "_ProjectPublications" pp ON pp."B" = p.id
            WHERE pp."A" = %s
            ORDER BY p."year" DESC
        """
        records = await self._fetch(sql, (project_id,))
        return [Publication(**r) for r in records]

    @override
    async def get_thesis_publications(self, thesis_id: str) -> list[Publication]:
        sql = """
            SELECT p.* FROM "Publication" p
            JOIN "_ThesisPublications" tp ON tp."A" = p.id
            WHERE tp."B" = %s
            ORDER BY p."year" DESC
        """
        records = await self._fetch(sql, (thesis_id,))
        return [Publication(**r) for r in records]
