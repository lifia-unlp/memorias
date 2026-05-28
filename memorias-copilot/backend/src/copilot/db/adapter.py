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

    # --- Tag Cloud / Topic Exploration ---
    @abstractmethod
    async def get_tag_cloud(self) -> dict[str, int]:
        pass

    # --- Complete Group Lists ---
    @abstractmethod
    async def get_all_members(self) -> list[Member]:
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
    async def get_project_members(self, project_id_or_slug: str) -> list[Member]:
        pass

    @abstractmethod
    async def get_member_projects(self, member_id_or_slug: str) -> list[Project]:
        pass

    @abstractmethod
    async def get_member_publications(self, member_id_or_slug: str) -> list[Publication]:
        pass

    @abstractmethod
    async def get_member_theses(self, member_id_or_slug: str) -> list[Thesis]:
        pass

    @abstractmethod
    async def get_member_scholarships(self, member_id_or_slug: str) -> list[Scholarship]:
        pass

    @abstractmethod
    async def get_project_publications(self, project_id_or_slug: str) -> list[Publication]:
        pass

    @abstractmethod
    async def get_thesis_publications(self, thesis_id_or_slug: str) -> list[Publication]:
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

                # Automatically ensure unaccent extension is enabled
                try:
                    async with self._pool.connection() as conn:
                        async with conn.cursor() as cur:
                            await cur.execute("CREATE EXTENSION IF NOT EXISTS unaccent;")
                        await conn.commit()
                except Exception as db_err:
                    # Gracefully handle situations where CREATE EXTENSION is not permitted (e.g. AWS RDS or GCP Cloud SQL)
                    # as long as it's already installed or if fallback is needed.
                    print(f"Warning: Could not ensure 'unaccent' extension is created: {db_err}")
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
        tokens = [t.strip() for t in query.split() if t.strip()]
        if not tokens:
            return []

        conditions = []
        params = {}
        for i, token in enumerate(tokens):
            param_name = f"token_{i}"
            conditions.append(f"""
                (unaccent("firstName") ILIKE unaccent(%({param_name})s)
                OR unaccent("lastName") ILIKE unaccent(%({param_name})s)
                OR unaccent("slug") ILIKE unaccent(%({param_name})s)
                OR unaccent("positionAtLab") ILIKE unaccent(%({param_name})s)
                OR unaccent("positionAtUnlp") ILIKE unaccent(%({param_name})s)
                OR unaccent("coursesAtUNLP") ILIKE unaccent(%({param_name})s)
                OR unaccent("shortCvInSpanish") ILIKE unaccent(%({param_name})s)
                OR unaccent("shortCvInEnglish") ILIKE unaccent(%({param_name})s)
                OR unaccent("interestsInSpanish") ILIKE unaccent(%({param_name})s)
                OR unaccent("interestsInEnglish") ILIKE unaccent(%({param_name})s))
            """)
            params[param_name] = f"%{token}%"

        where_clause = " AND ".join(conditions)
        sql = f"""
            SELECT * FROM "Member"
            WHERE {where_clause}
            ORDER BY "lastName" ASC, "firstName" ASC
            LIMIT 50
        """
        records = await self._fetch(sql, params)
        return [Member(**r) for r in records]

    @override
    async def search_projects(self, query: str) -> list[Project]:
        tokens = [t.strip() for t in query.split() if t.strip()]
        if not tokens:
            return []

        conditions = []
        params = {}
        for i, token in enumerate(tokens):
            param_name = f"token_{i}"
            conditions.append(f"""
                (unaccent("title") ILIKE unaccent(%({param_name})s)
                OR unaccent("code") ILIKE unaccent(%({param_name})s)
                OR unaccent("summary") ILIKE unaccent(%({param_name})s)
                OR unaccent("slug") ILIKE unaccent(%({param_name})s))
            """)
            params[param_name] = f"%{token}%"

        where_clause = " AND ".join(conditions)
        sql = f"""
            SELECT * FROM "Project"
            WHERE {where_clause}
            ORDER BY "startDate" DESC NULLS LAST
            LIMIT 50
        """
        records = await self._fetch(sql, params)
        return [Project(**r) for r in records]

    @override
    async def search_theses(self, query: str) -> list[Thesis]:
        tokens = [t.strip() for t in query.split() if t.strip()]
        if not tokens:
            return []

        conditions = []
        params = {}
        for i, token in enumerate(tokens):
            param_name = f"token_{i}"
            conditions.append(f"""
                (unaccent("title") ILIKE unaccent(%({param_name})s)
                OR unaccent("career") ILIKE unaccent(%({param_name})s)
                OR unaccent("student") ILIKE unaccent(%({param_name})s)
                OR unaccent("director") ILIKE unaccent(%({param_name})s)
                OR unaccent("coDirector") ILIKE unaccent(%({param_name})s)
                OR unaccent("summary") ILIKE unaccent(%({param_name})s))
            """)
            params[param_name] = f"%{token}%"

        where_clause = " AND ".join(conditions)
        sql = f"""
            SELECT * FROM "Thesis"
            WHERE {where_clause}
            ORDER BY "startDate" DESC NULLS LAST
            LIMIT 50
        """
        records = await self._fetch(sql, params)
        return [Thesis(**r) for r in records]

    @override
    async def search_scholarships(self, query: str) -> list[Scholarship]:
        tokens = [t.strip() for t in query.split() if t.strip()]
        if not tokens:
            return []

        conditions = []
        params = {}
        for i, token in enumerate(tokens):
            param_name = f"token_{i}"
            conditions.append(f"""
                (unaccent("title") ILIKE unaccent(%({param_name})s)
                OR unaccent("type") ILIKE unaccent(%({param_name})s)
                OR unaccent("student") ILIKE unaccent(%({param_name})s)
                OR unaccent("director") ILIKE unaccent(%({param_name})s)
                OR unaccent("coDirector") ILIKE unaccent(%({param_name})s)
                OR unaccent("summary") ILIKE unaccent(%({param_name})s))
            """)
            params[param_name] = f"%{token}%"

        where_clause = " AND ".join(conditions)
        sql = f"""
            SELECT * FROM "Scholarship"
            WHERE {where_clause}
            ORDER BY "startDate" DESC NULLS LAST
            LIMIT 50
        """
        records = await self._fetch(sql, params)
        return [Scholarship(**r) for r in records]

    @override
    async def search_publications(self, query: str) -> list[Publication]:
        tokens = [t.strip() for t in query.split() if t.strip()]
        if not tokens:
            return []

        conditions = []
        params = {}
        for i, token in enumerate(tokens):
            param_name = f"token_{i}"
            conditions.append(f"""
                (unaccent("title") ILIKE unaccent(%({param_name})s)
                OR unaccent("authors") ILIKE unaccent(%({param_name})s)
                OR unaccent("type") ILIKE unaccent(%({param_name})s)
                OR unaccent("ranking") ILIKE unaccent(%({param_name})s)
                OR unaccent("year"::text) ILIKE unaccent(%({param_name})s))
            """)
            params[param_name] = f"%{token}%"

        where_clause = " AND ".join(conditions)
        sql = f"""
            SELECT * FROM "Publication"
            WHERE {where_clause}
            ORDER BY "year" DESC
            LIMIT 50
        """
        records = await self._fetch(sql, params)
        return [Publication(**r) for r in records]

    # --- Tag Cloud / Topic Exploration ---
    @override
    async def get_tag_cloud(self) -> dict[str, int]:
        sql = """
            SELECT tag, COUNT(*) as count FROM (
                SELECT unnest(tags) as tag FROM "Member"
                UNION ALL
                SELECT unnest(tags) as tag FROM "Project"
                UNION ALL
                SELECT unnest(tags) as tag FROM "Thesis"
                UNION ALL
                SELECT unnest(tags) as tag FROM "Scholarship"
                UNION ALL
                SELECT unnest(tags) as tag FROM "Publication"
            ) sub
            WHERE tag IS NOT NULL AND tag != ''
            GROUP BY tag
            ORDER BY count DESC, tag ASC
            LIMIT 100
        """
        records = await self._fetch(sql)
        return {r["tag"]: int(r["count"]) for r in records}

    # --- Complete Group Lists ---
    @override
    async def get_all_members(self) -> list[Member]:
        sql = 'SELECT * FROM "Member" ORDER BY "lastName" ASC, "firstName" ASC'
        records = await self._fetch(sql)
        return [Member(**r) for r in records]

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
    async def get_project_members(self, project_id_or_slug: str) -> list[Member]:
        sql = """
            SELECT m.* FROM "Member" m
            JOIN "_ProjectMembers" pm ON pm."A" = m.id
            JOIN "Project" p ON pm."B" = p.id
            WHERE p.id = %s OR p.slug = %s
            ORDER BY m."lastName" ASC, m."firstName" ASC
        """
        records = await self._fetch(sql, (project_id_or_slug, project_id_or_slug))
        return [Member(**r) for r in records]

    @override
    async def get_member_projects(self, member_id_or_slug: str) -> list[Project]:
        sql = """
            SELECT p.* FROM "Project" p
            JOIN "_ProjectMembers" pm ON pm."B" = p.id
            JOIN "Member" m ON pm."A" = m.id
            WHERE m.id = %s OR m.slug = %s
            ORDER BY p."startDate" DESC NULLS LAST
        """
        records = await self._fetch(sql, (member_id_or_slug, member_id_or_slug))
        return [Project(**r) for r in records]

    @override
    async def get_member_publications(self, member_id_or_slug: str) -> list[Publication]:
        sql = """
            SELECT p.* FROM "Publication" p
            JOIN "_PublicationMembers" pm ON pm."B" = p.id
            JOIN "Member" m ON pm."A" = m.id
            WHERE m.id = %s OR m.slug = %s
            ORDER BY p."year" DESC
        """
        records = await self._fetch(sql, (member_id_or_slug, member_id_or_slug))
        return [Publication(**r) for r in records]

    @override
    async def get_member_theses(self, member_id_or_slug: str) -> list[Thesis]:
        sql = """
            SELECT t.* FROM "Thesis" t
            JOIN "_ThesisMembers" tm ON tm."B" = t.id
            JOIN "Member" m ON tm."A" = m.id
            WHERE m.id = %s OR m.slug = %s
            ORDER BY t."startDate" DESC NULLS LAST
        """
        records = await self._fetch(sql, (member_id_or_slug, member_id_or_slug))
        return [Thesis(**r) for r in records]

    @override
    async def get_member_scholarships(self, member_id_or_slug: str) -> list[Scholarship]:
        sql = """
            SELECT s.* FROM "Scholarship" s
            JOIN "_ScholarshipMembers" sm ON sm."B" = s.id
            JOIN "Member" m ON sm."A" = m.id
            WHERE m.id = %s OR m.slug = %s
            ORDER BY s."startDate" DESC NULLS LAST
        """
        records = await self._fetch(sql, (member_id_or_slug, member_id_or_slug))
        return [Scholarship(**r) for r in records]

    @override
    async def get_project_publications(self, project_id_or_slug: str) -> list[Publication]:
        sql = """
            SELECT p.* FROM "Publication" p
            JOIN "_ProjectPublications" pp ON pp."B" = p.id
            JOIN "Project" pr ON pp."A" = pr.id
            WHERE pr.id = %s OR pr.slug = %s
            ORDER BY p."year" DESC
        """
        records = await self._fetch(sql, (project_id_or_slug, project_id_or_slug))
        return [Publication(**r) for r in records]

    @override
    async def get_thesis_publications(self, thesis_id_or_slug: str) -> list[Publication]:
        sql = """
            SELECT p.* FROM "Publication" p
            JOIN "_ThesisPublications" tp ON tp."A" = p.id
            JOIN "Thesis" t ON tp."B" = t.id
            WHERE t.id = %s OR t.slug = %s
            ORDER BY p."year" DESC
        """
        records = await self._fetch(sql, (thesis_id_or_slug, thesis_id_or_slug))
        return [Publication(**r) for r in records]
