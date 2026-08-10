from abc import ABC, abstractmethod
from typing import Any, Final, final, override

from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

from copilot.models import (
    FollowUpHistory,
    FollowUpItem,
    Member,
    Project,
    Publication,
    Scholarship,
    Thesis,
    UserInfo,
)


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

    # --- User & Session Authentication Methods ---
    @abstractmethod
    async def get_user_by_id_or_email(self, identifier: str) -> UserInfo | None:
        pass

    # --- Follow-Up Query Methods ---
    @abstractmethod
    async def search_followup_items(
        self,
        query: str = "",
        category: str | None = None,
        status: str | None = None,
        show_archived: bool = False,
    ) -> list[FollowUpItem]:
        pass

    @abstractmethod
    async def get_recent_followup_changes(self, days: int = 30) -> list[dict[str, Any]]:
        pass

    @abstractmethod
    async def get_stale_followup_items(self, days: int = 30) -> list[FollowUpItem]:
        pass

    @abstractmethod
    async def get_member_followups(self, member_id_or_slug: str) -> list[FollowUpItem]:
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

    # --- User & Session Authentication Methods ---
    @override
    async def get_user_by_id_or_email(self, identifier: str) -> UserInfo | None:
        sql = """
            SELECT u.id, u.email, u.name, u.role, u."memberId",
                   m."firstName" || ' ' || m."lastName" as "memberName",
                   m.slug as "memberSlug"
            FROM "User" u
            LEFT JOIN "Member" m ON u."memberId" = m.id
            WHERE u.id = %s OR u.email = %s
        """
        r = await self._fetchrow(sql, (identifier, identifier))
        return UserInfo(**r) if r else None

    # Helper function to enrich FollowUpItems with owners and history
    async def _populate_followup_items(self, items: list[dict[str, Any]]) -> list[FollowUpItem]:
        if not items:
            return []

        item_ids = [i["id"] for i in items]

        # Fetch owners
        owners_sql = """
            SELECT fo."A" as item_id, m."firstName" || ' ' || m."lastName" as owner_name
            FROM "_FollowUpOwners" fo
            JOIN "Member" m ON fo."B" = m.id
            WHERE fo."A" = ANY(%s)
        """
        owner_rows = await self._fetch(owners_sql, (item_ids,))
        owners_by_item: dict[str, list[str]] = {}
        for row in owner_rows:
            owners_by_item.setdefault(row["item_id"], []).append(row["owner_name"])

        # Fetch histories
        history_sql = """
            SELECT h.id, h."followUpItemId", h."fromStatus", h."toStatus", h.notes,
                   h."meetingDate", h."loggedById", u.name as "loggedByName"
            FROM "FollowUpHistory" h
            LEFT JOIN "User" u ON h."loggedById" = u.id
            WHERE h."followUpItemId" = ANY(%s)
            ORDER BY h."meetingDate" DESC
        """
        history_rows = await self._fetch(history_sql, (item_ids,))
        history_by_item: dict[str, list[FollowUpHistory]] = {}
        for h in history_rows:
            history_by_item.setdefault(h["followUpItemId"], []).append(
                FollowUpHistory(**h)
            )

        res = []
        for item in items:
            iid = item["id"]
            res.append(
                FollowUpItem(
                    id=item["id"],
                    title=item["title"],
                    description=item["description"],
                    category=item["category"],
                    status=item["status"],
                    archived=item["archived"],
                    createdAt=item["createdAt"],
                    updatedAt=item["updatedAt"],
                    owners=owners_by_item.get(iid, []),
                    history=history_by_item.get(iid, []),
                )
            )
        return res

    @override
    async def search_followup_items(
        self,
        query: str = "",
        category: str | None = None,
        status: str | None = None,
        show_archived: bool = False,
    ) -> list[FollowUpItem]:
        conditions = []
        params: dict[str, Any] = {}

        if not show_archived:
            conditions.append('f.archived = FALSE')

        if category:
            conditions.append('f.category = %(category)s')
            params["category"] = category.upper()

        if status:
            conditions.append('f.status = %(status)s')
            params["status"] = status.upper()

        if query:
            tokens = [t.strip() for t in query.split() if t.strip()]
            for i, token in enumerate(tokens):
                p_name = f"token_{i}"
                conditions.append(f"""
                    (unaccent(f.title) ILIKE unaccent(%({p_name})s)
                    OR unaccent(COALESCE(f.description, '')) ILIKE unaccent(%({p_name})s))
                """)
                params[p_name] = f"%{token}%"

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        sql = f"""
            SELECT f.* FROM "FollowUpItem" f
            {where_clause}
            ORDER BY f."updatedAt" DESC
            LIMIT 50
        """
        items = await self._fetch(sql, params)
        return await self._populate_followup_items(items)

    @override
    async def get_recent_followup_changes(self, days: int = 30) -> list[dict[str, Any]]:
        sql = """
            SELECT h.id as history_id, h."fromStatus", h."toStatus", h.notes, h."meetingDate",
                   u.name as logged_by, f.id as item_id, f.title as item_title,
                   f.category, f.status as current_status
            FROM "FollowUpHistory" h
            JOIN "FollowUpItem" f ON h."followUpItemId" = f.id
            LEFT JOIN "User" u ON h."loggedById" = u.id
            WHERE h."meetingDate" >= NOW() - (%s || ' days')::INTERVAL
            ORDER BY h."meetingDate" DESC
            LIMIT 50
        """
        records = await self._fetch(sql, (days,))
        return records

    @override
    async def get_stale_followup_items(self, days: int = 30) -> list[FollowUpItem]:
        sql = """
            SELECT f.* FROM "FollowUpItem" f
            LEFT JOIN (
                SELECT "followUpItemId", MAX("meetingDate") as last_update
                FROM "FollowUpHistory"
                GROUP BY "followUpItemId"
            ) h ON f.id = h."followUpItemId"
            WHERE f.archived = FALSE
              AND f.status NOT IN ('COMPLETED', 'REJECTED')
              AND (
                h.last_update IS NULL OR h.last_update < NOW() - (%s || ' days')::INTERVAL
              )
            ORDER BY f."updatedAt" ASC
            LIMIT 50
        """
        items = await self._fetch(sql, (days,))
        return await self._populate_followup_items(items)

    @override
    async def get_member_followups(self, member_id_or_slug: str) -> list[FollowUpItem]:
        sql = """
            SELECT f.* FROM "FollowUpItem" f
            JOIN "_FollowUpOwners" fo ON fo."A" = f.id
            JOIN "Member" m ON fo."B" = m.id
            WHERE (m.id = %s OR m.slug = %s) AND f.archived = FALSE
            ORDER BY f."updatedAt" DESC
        """
        items = await self._fetch(sql, (member_id_or_slug, member_id_or_slug))
        return await self._populate_followup_items(items)
