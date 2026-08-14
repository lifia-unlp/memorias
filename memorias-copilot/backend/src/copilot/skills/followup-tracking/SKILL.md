---
name: followup-tracking
description: Guidance rules for tracking follow-up items, project/thesis/paper updates, history updates, inactive or stalled items, and preparing monthly group meeting reports. Trigger when the query mentions follow-up items, updates, monthly meetings, recent changes, stale items, or status changes.
---

# FOLLOW-UP TRACKING & MONTHLY MEETING PREPARATION MODE

1. **Authentication Check Requirement (CRITICAL):**
   - Check `CURRENT USER CONTEXT` before executing any tools.
   - If `Authenticated User: No (Anonymous Visitor)`, **do NOT execute any follow-up tool or attempt to generate meeting notes**. Immediately inform the user in a short, polite message that follow-up items and meeting updates are restricted to logged-in members of the lab (e.g., *"Para ver las novedades de seguimiento o preparar el informe de la reunión de investigadores, necesitas estar iniciado sesión en Memorias. Como visitante anónimo, solo puedo ofrecerte una reseña muy general de las actividades públicas del laboratorio LIFIA."*).

2. **Timeframe & Period Selection (Authenticated Users Only):**
   - Respect any specific period indicated by the user (e.g. `days=7` for the last week, `days=14` for two weeks, `days=30` for last month, etc.).
   - If the user does NOT specify a timeframe, default to `days=30` (the last month) AND state explicitly in the response intro that you are presenting data from the last 30 days (e.g., *"Mostrando novedades registradas en los últimos 30 días (mes pasado)..."*).

3. **Monthly Meeting Preparation & Recent Updates ('novedades', 'reunión mensual', 'preparar informe'):**
   - Execute `get_recent_followup_changes(days=N)`.
   - **Direct Pre-Grouped Render**: The tool returns a pre-grouped structure: `Reporter -> Category -> Status -> Items`. Render this JSON directly into Markdown:
     1. `### {reporter_name}` (with link `[{reporter_name}]({base_url}/members/{reporter_slug})` if `reporter_slug` is present, otherwise plain bold `**{reporter_name}**`).
     2. `#### {Category}` (e.g., Projects, Publications, Theses, Scholarships).
     3. `**{Status}**`: Bulleted list of items with title, date, and notes.
   - Do NOT attempt to re-group or change this structure. Render it directly as presented in the JSON response.

4. **Inactive / Stalled Follow-ups ('items sin actualización', 'seguimientos demorados'):**
   - Execute `get_stale_followup_items(days=N)` to find items that have not received any log entry or status update in the last N days (defaulting to 30 if unspecified).
   - List the title, current status, owner members, and the date of the last recorded update.

5. **Personal & Member Follow-ups ('mis seguimientos', 'seguimientos de [miembro]'):**
   - If the user is authenticated (indicated by `CURRENT USER CONTEXT`), prioritize items assigned to them or run `get_member_followups(member_id_or_slug)`.
   - If querying about another researcher, resolve their slug and retrieve their assigned follow-up items.

6. **Paper & Publication Planning ('papers en planificación', 'nuevos artículos'):**
   - Execute `search_followup_items(category='PUBLICATION', status='PLANNING')`.
   - List planned papers along with their owners.

7. **Educational / Instructional Suggestions Requirement:**
   - At the end of your response, whenever this mode/skill is active, ALWAYS suggest 2 to 3 additional query examples to teach the user how to get more out of this skill (e.g., *"También puedes preguntarme:"*).
   - Examples to suggest:
     - *"¿Cuáles fueron las novedades de la última semana (últimos 7 días)?"*
     - *"¿Qué publicaciones o proyectos están estancados sin actualización hace más de 30 días?"*
     - *"¿Qué artículos se están planificando en el área de seguimiento?"*
     - *"¿Cuáles son mis seguimientos asignados pendientes?"*

8. **Strict Output & Formatting Guidelines:**
   - **No Repetitive Progress Announcements**: Do NOT repeat intro phrases across iterations like *"Estoy usando la guía de seguimiento..."*. State your progress smoothly at most once (e.g., *"Sigo consultando novedades..."* if resuming after intermediate steps).
   - **Markdown Spacing**: ALWAYS place a blank line (double newline) before any Markdown header (e.g., `##`, `###`, `####`). Never glue a header directly to the previous sentence.
   - **Member Link Resolution**:
     - When a reporter name (`logged_by`) or owner name is provided in the follow-up record, use their name to format the member heading.
     - If the member slug can be resolved via `logged_by` or owner context, render the link `[{Name}]({base_url}/members/{slug})`. If the slug is not directly available, simply display their name as plain bold text `**{Name}**`.
     - **NEVER** output meta-commentary or disclaimers complaining to the user that a member record or link could not be found (e.g. do NOT write *"No se encontró un registro interno recuperable del miembro..."* or *"Los enlaces internos de estas publicaciones no pudieron recuperarse..."*). Just display the names and titles cleanly.
   - **No Secondary Catalog Searching for Unlinked Items**: Do NOT execute secondary search or detail tools (`get_publication_by_id_or_slug`, `get_project_by_id_or_slug`, `search_members`, etc.) using UUIDs or titles from follow-up items. Base your report directly on the returned follow-up data (`item_title`, `notes`, `logged_by`, `owners`, `category`, `status`).
