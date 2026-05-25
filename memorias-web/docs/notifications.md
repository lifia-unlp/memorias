# Notifications & Email System Guide

This document describes the design, structure, and functional content of the Memorias portal's automated email notification systems. It serves as a guide for administrators and developers to understand what information is included in emails, how triggers operate, and how the templates render for users.

---

## 1. Core Architecture Overview

The Memorias portal supports a dual-channel notification service:

1. **Immediate Notifications (Event-Driven)**: Direct, real-time alerts fired when a research entity (Publication, Project, Thesis, Scholarship) or a Member profile is created, modified, or deleted. These are sent only to the users directly linked to the changed profiles.
2. **Scheduled Digest Summaries (Chronological)**: Aggregated summaries of all laboratory modifications compiled over a specified timespan (daily, weekly, biweekly, monthly) and sent to all opted-in portal subscribers.

---

## 2. Immediate Notifications: Detailed Content Structure

Immediate notifications are triggered synchronously during database audit log events via `triggerImmediateNotification()` in `src/lib/notifications.ts`. 

### Subject Lines
*   **Format**: `[LabName Memorias] Alert: [Category] [ActionLabel]`
    *   `LabName`: Dynamic laboratory configuration (falls back to "Laboratory" if unconfigured).
    *   `Category`: The type of modified element (e.g., "Publication", "Project", "Thesis", "Scholarship", or "Profile" for Member updates).
    *   `ActionLabel`: The verb matching the database modification ("added", "updated", or "deleted").
*   *Example Subject*: `[LIFIA Memorias] Alert: Publication added`

### Email Body Components (Lighter Plain-Text Style)
*   **Greeting**: "Hello,"
*   **Context Statement**:
    *   If the changed entity is a **Member profile** itself:
        `This is an immediate notification regarding updates made to your official member profile.`
    *   If the changed entity is a **Research Item** (Publication, Project, etc.):
        `This is an immediate notification regarding a research item you are linked to in the portal.`
*   **Information Block** (Clean, left-bordered panel using `border-left: 3px solid #1976d2`):
    *   **Action**: "Created / Added" (for CREATE), "Updated / Modified" (for UPDATE), or "Deleted / Removed" (for DELETE).
    *   **Category**: The element type (e.g., "Publication").
    *   **Details**: The exact detail summary logged by the audit system (e.g., "Created publication: Autonomous Agent SE" or "Updated member profile: John Doe").
*   **Direct Call-To-Action (CTA)** (Omitted for DELETE actions):
    *   Renders a styled hyperlink button reading **"View [Category]"** (e.g., "View Publication").
    *   Links directly to the item's live page on the portal: `http://portal-domain/publications/autonomous-agent-se`.
*   **Opt-Out Footer**:
    *   A clean line divider followed by:
        `This email was sent from the [LabName] Memorias Portal because your account is linked to your member profile. If you wish to stop receiving these immediate alerts, you can customize your preferences at any time in your User Preferences.`
    *   Includes a direct hyperlink pointing to `/preferences`.

---

## 3. Scheduled Digests: Detailed Content Structure

Digest emails compile portal-wide modifications chronologically and are triggered via scheduled hits to the secure `/api/cron/digest` endpoint.

### Subject Lines
*   **Format**: `[LabName Memorias] [Frequency] Portal Digest`
    *   `Frequency`: Capitalized frequency string (e.g., "Daily", "Weekly", "Biweekly", or "Monthly").
*   *Example Subject*: `[LIFIA Memorias] Weekly Portal Digest`

### Email Body Components (Lighter Plain-Text Style)
*   **Greeting**: "Hello,"
*   **Context Statement**:
    `Here is your [frequency] summary of recent research activity and portal updates at the [LabName] Memorias Portal between [StartDate] and [EndDate].`
    *   `StartDate`: Cutoff calculation date (e.g., 7 days ago for weekly).
    *   `EndDate`: The current execution date.
*   **Section Header**:
    `Recent Portal Updates ([Count] changes)`
*   **Aggregated Unordered List** (Loops through all log events during the lookback period):
    *   **Format**: `[Category] [Action]: [Details] ([View details] link)`
        *   `Category`: The modified element type (e.g., "Publication", "Member", "Thesis").
        *   `Action`: "Added" (for CREATE), "Modified" (for UPDATE), or "Removed" (for DELETE).
        *   `Details`: Detailed audit logged string (e.g., "Created publication: Monorepo Migrations").
        *   `View details Link` (Omitted for DELETE actions): A styled inline link reading "View details" that directs the subscriber straight to the item's portal page.
*   *Example List Item*:
    *   **Publication Added**: Created publication: Monorepo Migrations ([View details](http://portal-domain/publications/monorepo-migrations))
    *   **Thesis Modified**: Updated thesis level to PhD ([View details](http://portal-domain/theses/agent-thesis))
    *   **Project Removed**: Deleted project: Former Lab Work
*   **Opt-Out Footer**:
    *   A clean line divider followed by:
        `This email was sent from the [LabName] Memorias Portal because you are subscribed to digest updates. If you wish to stop receiving these digest summaries, you can customize your preferences at any time in your User Preferences.`
    *   Includes a direct hyperlink pointing to `/preferences`.

---

## 4. How Admins Configure and Manage Notifications

### A. Environment Configuration
Ensure the following variables are specified in your production deployment `.env` file or container options:
*   `AUTH_URL`: The base domain of the portal (e.g., `https://memorias.ar`), which is used to construct all "View details" and "User Preferences" links inside email footers.
*   `DIGEST_FREQUENCY`: Determines the default lookback window for digest cron triggers (`"daily"`, `"weekly"`, `"biweekly"`, `"monthly"`). Defaults to `"weekly"`.
*   `CRON_SECRET`: A long, secure alphanumeric string used to authorize cron trigger endpoints.

### B. Triggering Digests via Cron
To automate digests, set up an external scheduler (like an LXC/VM crontab, Google Cloud Scheduler, or GitHub Actions) to send a secured `GET` request to your portal endpoint at your chosen interval:

```bash
# Weekly cron job example (every Sunday at 00:00) using curl:
0 0 * * 0 curl -H "Authorization: Bearer your_cron_secret_token" https://your-domain.com/api/cron/digest
```

Alternatively, you can trigger a custom frequency override manually in your browser or a webhook:
`https://your-domain.com/api/cron/digest?frequency=daily&secret=your_cron_secret_token`
