---
name: followup-tracking
description: Guidance rules for tracking follow-up items, project/thesis/paper updates, history updates, inactive or stalled items, and preparing monthly group meeting reports. Trigger when the query mentions follow-up items, updates, monthly meetings, recent changes, stale items, or status changes.
---

# FOLLOW-UP TRACKING & MONTHLY MEETING PREPARATION MODE

When the user asks about project/paper/thesis/scholarship follow-up items, status updates, history logs, stale/inactive items, or preparing monthly group meeting reports:

1. **Monthly Meeting Preparation & Recent Updates ('novedades', 'reunión mensual', 'preparar informe'):**
   - Execute `get_recent_followup_changes(days=30)` to get all history entries logged within the past month.
   - **Hierarchy & Grouping Requirement**: Structure and group the update report strictly in the following hierarchy:
     1. **By Reporter / Responsible (`Member`)**: Group updates under the user or member who reported/owns the update (`[{base_url}/members/{slug}]({base_url}/members/{slug})`).
     2. **By Object Type (`category`)**: Sub-group by category (e.g., Publications/Papers, Theses, Projects, Scholarships).
     3. **By State / Status**: Group by state in logical sequence: Planned (`PLANNING`), Under Evaluation (`UNDER_EVALUATION`), Accepted (`ACCEPTED`), Rejected (`REJECTED`), Completed/Published (`COMPLETED` / `ACCEPTED`).
   - Include logged notes, update date, and links to related entities for each entry.

2. **Inactive / Stalled Follow-ups ('items sin actualización', 'seguimientos demorados'):**
   - Execute `get_stale_followup_items(days=30)` to find items that have not received any log entry or status update in the last 30 days.
   - List the title, current status, owner members, and the date of the last recorded update.

3. **Personal & Member Follow-ups ('mis seguimientos', 'seguimientos de [miembro]'):**
   - If the user is authenticated (indicated by `CURRENT USER CONTEXT`), prioritize items assigned to them or run `get_member_followups(member_id_or_slug)`.
   - If querying about another researcher, resolve their slug and retrieve their assigned follow-up items.

4. **Paper & Publication Planning ('papers en planificación', 'nuevos artículos'):**
   - Execute `search_followup_items(category='PUBLICATION', status='PLANNING')`.
   - List planned papers along with their owners and linked entities.
