import json
import logging
from typing import Any, Final, final

from copilot.db.adapter import DatabaseAdapter

logger = logging.getLogger("uvicorn")


@final
class ToolDispatcher:
    def __init__(self, db: DatabaseAdapter) -> None:
        self._db: Final[DatabaseAdapter] = db

    async def dispatch(self, name: str, arguments: dict[str, Any]) -> str:
        logger.info(
            f"[Dispatcher] Dispatching tool call: '{name}' with arguments: {arguments}"
        )
        try:
            # --- Search Tools ---
            if name == "search_members":
                members = await self._db.search_members(arguments["query"])
                return json.dumps([m.model_dump(mode="json") for m in members])

            elif name == "search_projects":
                projects = await self._db.search_projects(arguments["query"])
                return json.dumps([p.model_dump(mode="json") for p in projects])

            elif name == "search_theses":
                theses = await self._db.search_theses(arguments["query"])
                return json.dumps([t.model_dump(mode="json") for t in theses])

            elif name == "search_scholarships":
                scholarships = await self._db.search_scholarships(arguments["query"])
                return json.dumps([s.model_dump(mode="json") for s in scholarships])

            elif name == "search_publications":
                publications = await self._db.search_publications(arguments["query"])
                return json.dumps([p.model_dump(mode="json") for p in publications])

            # --- Detail Retrieval Tools ---
            elif name == "get_member_by_id_or_slug":
                member = await self._db.get_member_by_id_or_slug(
                    arguments["id_or_slug"]
                )
                return (
                    member.model_dump_json()
                    if member
                    else json.dumps({"error": "Member not found"})
                )

            elif name == "get_project_by_id_or_slug":
                project = await self._db.get_project_by_id_or_slug(
                    arguments["id_or_slug"]
                )
                return (
                    project.model_dump_json()
                    if project
                    else json.dumps({"error": "Project not found"})
                )

            elif name == "get_thesis_by_id_or_slug":
                thesis = await self._db.get_thesis_by_id_or_slug(
                    arguments["id_or_slug"]
                )
                return (
                    thesis.model_dump_json()
                    if thesis
                    else json.dumps({"error": "Thesis not found"})
                )

            elif name == "get_scholarship_by_id_or_slug":
                scholarship = await self._db.get_scholarship_by_id_or_slug(
                    arguments["id_or_slug"]
                )
                return (
                    scholarship.model_dump_json()
                    if scholarship
                    else json.dumps({"error": "Scholarship not found"})
                )

            elif name == "get_publication_by_id_or_slug":
                publication = await self._db.get_publication_by_id_or_slug(
                    arguments["id_or_slug"]
                )
                return (
                    publication.model_dump_json()
                    if publication
                    else json.dumps({"error": "Publication not found"})
                )

            # --- Relationship Traversal Tools ---
            elif name == "get_project_members":
                members = await self._db.get_project_members(arguments["project_id"])
                return json.dumps([m.model_dump(mode="json") for m in members])

            elif name == "get_member_projects":
                projects = await self._db.get_member_projects(arguments["member_id"])
                return json.dumps([p.model_dump(mode="json") for p in projects])

            elif name == "get_member_publications":
                publications = await self._db.get_member_publications(
                    arguments["member_id"]
                )
                return json.dumps([p.model_dump(mode="json") for p in publications])

            elif name == "get_member_theses":
                theses = await self._db.get_member_theses(arguments["member_id"])
                return json.dumps([t.model_dump(mode="json") for t in theses])

            elif name == "get_member_scholarships":
                scholarships = await self._db.get_member_scholarships(
                    arguments["member_id"]
                )
                return json.dumps([s.model_dump(mode="json") for s in scholarships])

            elif name == "get_project_publications":
                publications = await self._db.get_project_publications(
                    arguments["project_id"]
                )
                return json.dumps([p.model_dump(mode="json") for p in publications])

            elif name == "get_thesis_publications":
                publications = await self._db.get_thesis_publications(
                    arguments["thesis_id"]
                )
                return json.dumps([p.model_dump(mode="json") for p in publications])

            else:
                logger.error(f"[Dispatcher] Tool '{name}' is not registered.")
                return json.dumps({"error": f"Tool '{name}' is not registered."})

        except Exception as e:
            logger.error(f"[Dispatcher] Exception in tool '{name}': {e}")
            return json.dumps({"error": f"Internal execution error: {str(e)}"})
