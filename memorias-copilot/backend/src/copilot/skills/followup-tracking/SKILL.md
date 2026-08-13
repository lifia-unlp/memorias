---
name: followup-tracking
description: Guidance rules for tracking follow-up items, project/thesis/paper updates, history updates, inactive or stalled items, and preparing monthly group meeting reports. Trigger when the query mentions follow-up items, updates, monthly meetings, recent changes, stale items, or status changes.
---

# FOLLOW-UP TRACKING & MONTHLY MEETING PREPARATION MODE

When the user asks about project/paper/thesis/scholarship follow-up items, status updates, history logs, stale/inactive items, or preparing monthly group meeting reports:

1. **Timeframe & Period Selection:**
   - Respect any specific period indicated by the user (e.g. `days=7` for the last week, `days=14` for two weeks, `days=30` for last month, etc.).
   - If the user does NOT specify a timeframe, default to `days=30` (the last month) AND state explicitly in the response intro that you are presenting data from the last 30 days (e.g., *"Mostrando novedades registradas en los últimos 30 días (mes pasado)..."*).

2. **Monthly Meeting Preparation & Recent Updates ('novedades', 'reunión mensual', 'preparar informe'):**
   - Execute `get_recent_followup_changes(days=N)`.
   - **Hierarchy & Grouping Requirement**: Structure and group the update report strictly in the following hierarchy:
     1. **By Reporter / Responsible (`Member`)**: Group updates under the user or member who reported/owns the update (`[{base_url}/members/{slug}]({base_url}/members/{slug})`).
     2. **By Object Type (`category`)**: Sub-group by category (e.g., Publications/Papers, Theses, Projects, Scholarships).
     3. **By State / Status**: Group by state in logical sequence: Planned (`PLANNING`), Under Evaluation (`UNDER_EVALUATION`), Accepted (`ACCEPTED`), Rejected (`REJECTED`), Completed/Published (`COMPLETED` / `ACCEPTED`).
   - Include logged notes, update date, and links to related entities for each entry.

3. **Inactive / Stalled Follow-ups ('items sin actualización', 'seguimientos demorados'):**
   - Execute `get_stale_followup_items(days=N)` to find items that have not received any log entry or status update in the last N days (defaulting to 30 if unspecified).
   - List the title, current status, owner members, and the date of the last recorded update.

4. **Personal & Member Follow-ups ('mis seguimientos', 'seguimientos de [miembro]'):**
   - If the user is authenticated (indicated by `CURRENT USER CONTEXT`), prioritize items assigned to them or run `get_member_followups(member_id_or_slug)`.
   - If querying about another researcher, resolve their slug and retrieve their assigned follow-up items.

5. **Paper & Publication Planning ('papers en planificación', 'nuevos artículos'):**
   - Execute `search_followup_items(category='PUBLICATION', status='PLANNING')`.
   - List planned papers along with their owners.

6. **Educational / Instructional Suggestions Requirement:**
   - At the end of your response, whenever this mode/skill is active, ALWAYS suggest 2 to 3 additional query examples to teach the user how to get more out of this skill (e.g., *"También puedes preguntarme:"*).
   - Examples to suggest:
     - *"¿Cuáles fueron las novedades de la última semana (últimos 7 días)?"*
     - *"¿Qué publicaciones o proyectos están estancados sin actualización hace más de 30 días?"*
     - *"¿Qué artículos se están planificando en el área de seguimiento?"*
     - *"¿Cuáles son mis seguimientos asignados pendientes?"*

7. **Strict Scope & Entity Linking Rules:**
   - Do NOT execute secondary search or detail tools (`get_publication_by_id_or_slug`, `get_project_by_id_or_slug`, `search_members`, etc.) using UUIDs or titles from follow-up items.
   - Base your answer directly and entirely on the returned follow-up query data (`item_title`, `notes`, `logged_by`, `owners`, `category`, `status`).
   - If a follow-up item does not explicitly link to a catalog object, format its title as plain text or italicized text — do NOT attempt to search for it or guess an unlinked object's slug.
