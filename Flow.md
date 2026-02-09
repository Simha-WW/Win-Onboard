# WinOnboard — End-to-End Flow

This document describes the implemented end-to-end flow for WinOnboard, from HR creating a user through document submission, background verification, learning assignment, monitoring, and reminder emails. All steps and timings are based on code present in the repository (no features have been added or assumed beyond what the code implements).

## High-level overview

1. HR creates a fresher account in the HR portal (backend API / admin UI).
2. Backend creates the user record, generates a temporary password, stores a bcrypt-hashed password, and sends a welcome email with credentials.
3. New hire uploads required documents to the portal; documents are stored in Azure Blob Storage.
4. Background verification (education/employment) and vendor verification workflows run; HR receives notifications of submission and verification results.
5. L&D (Learning & Development) assigns a learning plan to the user; backend calculates duration and sets a deadline.
6. The system monitors learning progress and shows countdowns/urgency in the UI.
7. Automated reminder emails are sent on a schedule to users with incomplete learning plans; the scheduler and behavior are configurable via environment variables.

## Detailed step-by-step flow (with code references)

1) HR creates user (onboarding)

- Trigger: HR uses the HR portal UI which calls the backend HR endpoints (see `POST /api/hr/freshers` and related routes in the backend routes/controllers).
- Backend actions:
  - Creates a fresher/user DB record (MySQL / MSSQL as configured).
  - Generates a temporary password and stores a bcrypt hash.
  - Sends a welcome email containing login details using the email service.

See code references:
- Backend HR routes and controllers: [Backend/src/controllers](Backend/src/controllers/) (HR-related files).
- Password & welcome email utilities and services: [Backend/src/services/email.service.ts](Backend/src/services/email.service.ts) and related utils.
- Example/test helper: `Backend/create-test-fresher.js`, `Backend/setup-hr-password.js`.

2) Document upload & Background Verification (BGV)

- User uploads documents via frontend; uploads go to Azure Blob Storage (env vars: `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER_NAME`).
- Backend provides secure upload endpoints and helper scripts for blob tests.
- BGV flow:
  - HR/verification scripts/processes review uploaded documents.
  - Email notifications are sent for BGV submission and results.

See code references:
- Blob storage tests and utilities: files matching `Backend/test-blob-*`, `Backend/test-blob-upload-flow.js`.
- BGV test and email notification: `Backend/test-bgv-email-notification.js`, BGV helper scripts around `bgv` in `Backend/`.

3) Vendor verification

- Vendor verification helpers and summary documents exist in `VENDOR_VERIFICATION_SUMMARY.md` and related scripts in `Backend/`.

4) Learning assignment (L&D flow)

- Who assigns: L&D admin (or automated workflows) assigns a learning plan to a user via backend APIs.
- Assignment logic (implemented):
  - Backend fetches learning items (from department tables or configured resources).
  - The total required duration is computed as the sum of `duration_minutes` for all assigned items plus the configured buffer (implementation adds ~2 extra days as described in the learning summary).
  - Backend writes an assignment record containing `duration_to_complete_days`, `deadline`, and `last_reminder_sent` (DB columns added by migration scripts).
  - Per-item progress entries are created in `user_learning_progress` with `duration_minutes` per item.

See code & documentation:
- Learning implementation summary: `LEARNING_DURATION_IMPLEMENTATION.md`.
- Backend learning services: `Backend/src/services/learning-development.service.ts` and `Backend/src/services/learning-reminder.service.ts` (where implemented).
- Migration / helper scripts: `Backend/add-duration-columns.js`, `Backend/add-reminder-column.js` (and corresponding SQL files).
- Frontend UI: `Frontend/src/pages/*` and `Frontend/src/services/ldApi.ts` (duration input and displays), `Frontend/src/pages/UserLearning.tsx` and L&D pages.

5) Monitoring and reminders

- Scheduler:
  - The server initializes a cron job (node-cron) to run the reminder task on a schedule.
  - Default implementation sends reminders every 2 days (cron: `0 9 */2 * *`) — this is configurable via `REMINDER_SCHEDULE` in `.env`.
  - A startup test mode can trigger reminders immediately when `SEND_REMINDERS_ON_STARTUP=true`.

- Reminder selection logic:
  - Query users with incomplete learning plans.
  - Filter users who either have never received a reminder or whose `last_reminder_sent` is older than the configured interval (implementation checks a 2+ day gap by default).
  - For each selected user, calculate progress percentage and days remaining, generate an HTML motivational email with progress stats and CTA, send email, and update `last_reminder_sent`.

See code & tests:
- Reminder service and scheduler: `Backend/src/services/learning-reminder.service.ts`, `Backend/src/server.ts` (scheduler init).
- Test helper: `Backend/test-reminders.js`.
- Reminder implementation note and details: `LEARNING_DURATION_IMPLEMENTATION.md`.

Important: The repository implements a 2-day reminder cadence by default (every 2 days). If you want the system to use 20-, 60-, 90-day reminders instead, this is a configuration/implementation change (I can implement that change on request). The current codebase does not contain a built-in 20/60/90-day schedule.

6) Completion and post-completion

- When user completes all assigned learning items, progress reaches 100% and the UI and services reflect completion.
- Optional behaviors (some present as TODOs or roadmap items): congratulatory email, certificate issuance, dashboard analytics.

## End-to-end timeline (sequence)

1. HR creates fresher → backend creates user, password hashed, welcome email sent.
2. User logs in → uploads documents → BGV submission triggered → HR notified.
3. Vendor verification (if applicable) runs and notifies HR/vendor.
4. L&D assigns learning plan → backend calculates duration & deadline → user notified of learning plan.
5. User progresses through learning modules → progress stored in `user_learning_progress`.
6. Cron-based reminders run (every 2 days by default) → reminder emails sent to incomplete users → `last_reminder_sent` updated.
7. User completes plan → system records completion; reminders stop.

## Where to look in the code (quick links)

- AI assistant: `Backend/src/features/ai-agent/*` and `Frontend/src/components/AIAgentChat.jsx`.
- HR endpoints and helpers: `Backend/src/controllers/`, `Backend/create-test-fresher.js`, `Backend/setup-hr-password.js`.
- Email service and templates: `Backend/src/services/email.service.ts`, test scripts such as `Backend/test-bgv-email-notification.js`.
- Learning & reminders: `LEARNING_DURATION_IMPLEMENTATION.md`, `Backend/src/services/learning-development.service.ts`, `Backend/src/services/learning-reminder.service.ts`, `Backend/test-reminders.js`.
- Blob storage: `Backend/test-blob-*`, `Backend/test-blob-upload-flow.js`, and env variables in `Backend/.env`.

## Notes, constraints, and next steps

- This Flow.md reflects the current implementation. The repository implements a configurable reminder scheduler but defaults to sending reminders every 2 days. It does not implement an automatic 20/60/90-day reminder policy out-of-the-box.
- If you want a 20/60/90 schedule (or multiple reminder tiers), I can implement that scheduler change and update the reminder logic and email content.

---

If you'd like, I can now:

- update the reminder schedule to 20/60/90 days and add configurable tiers, or
- run a grep to list all files referenced in this document for quick verification.
