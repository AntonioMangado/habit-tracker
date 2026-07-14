# Habit Tracker

React + Vite + TypeScript habit tracking web app.

## Tech stack

- **Runtime**: React 18 + TypeScript
- **Bundler**: Vite
- **Tests**: Vitest + React Testing Library (jsdom)
- **State**: Zustand (added in T002)
- **Backend**: Firebase — Firestore (data) + Firebase Auth (Google sign-in), added in T002
- **Path alias**: `@/` → `src/`

## Firebase conventions

- Firebase app is initialized once in `src/lib/firebase.ts`, exporting `auth` and `db`. No component or store file calls the `firebase/*` SDKs directly — everything goes through this module or the Zustand store.
- Config comes from Vite env vars (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`), read from `.env.local` (gitignored). Never hardcode Firebase config values in source.
- Firestore layout is per-user: `users/{uid}/habits/{habitId}` and `users/{uid}/entries/{entryId}`. Every read/write is scoped to the signed-in user's `uid`.
- Firestore offline persistence is enabled (`persistentLocalCache`/IndexedDB) so the app keeps working offline and syncs when back online.
- Security rules live in `firestore.rules` at the repo root and must restrict all access to `request.auth.uid == uid`. Any task that changes the Firestore data shape must update `firestore.rules` in the same change.
- Firebase SDK calls must be mockable in tests (wrap them behind the store/hooks) — no test should hit a real Firebase project.

## Scripts

```
npm run dev     # start dev server
npm test        # run Vitest in watch mode
npm run build   # production build
npm run lint    # ESLint check
```

---

## Agent workflow

When the user says something like **"next task"**, **"run next task"**, or **"take the next task"**, execute the following pipeline:

### Step 1 — Pick the task

Find the first task in `TASKS.md` with `Status: pending` whose Requisites are all `done`.
Mark it `in-progress` in TASKS.md.

### Step 2 — Planning agent (model: opus)

Spawn an Agent with `model: "opus"` and `subagent_type: "claude"`.

The agent must:

- Read the **entire codebase** (all files under `src/`, plus `TASKS.md`, `package.json`, `vite.config.ts`)
- Read the **Firebase conventions** section of this file
- Read the task spec (description + acceptance criteria)
- Produce a **comprehensive implementation plan** covering:
  - Files to create or modify (with paths)
  - TypeScript interfaces / function signatures
  - Test cases to write first (TDD — one test case per acceptance criterion)
  - Implementation steps in order
  - Edge cases to handle

If the task touches auth, Firestore data, or security rules, the plan must additionally cover:

- Which Firestore collections/documents are read or written, under the `users/{uid}/...` layout
- Any changes needed to `firestore.rules`, and how those rules will be reasoned about (not just "restrict to owner" — call out the exact match/allow statements)
- How Firebase Auth/Firestore calls will be mocked in unit tests (the plan must not rely on hitting a live Firebase project during `npm test`)
- Whether Firestore's offline cache affects the acceptance criteria (e.g. optimistic UI updates before a write round-trips)
- Any new environment variables required, and a note that they must be documented (not hardcoded)

The plan is returned as the agent's response and passed directly to Step 3 (not saved to disk).

### Step 3 — Implementer agent (model: haiku)

Spawn an Agent with `model: "haiku"` and `subagent_type: "claude"`.

Provide the agent:

- The full plan from Step 2
- The task spec (description + acceptance criteria)
- Instruction to follow **TDD strictly**: write each test first, confirm it fails, then implement until it passes

The agent must:

- Write all test files before writing production code
- Run `npm test` after each implementation step and fix failures before moving on
- Only implement what is in the plan — no extra features

### Step 4 — Reviewer agent (model: opus)

Spawn an Agent with `model: "opus"` and `subagent_type: "claude"`.

The agent must:

- Read every file that was created or modified by the implementer
- Check for: correctness, TypeScript type safety, component best practices, test coverage, accessibility (basic), performance red flags
- List specific optimization opportunities with concrete suggestions
- If issues are found: spawn a follow-up haiku agent to apply the fixes, then verify with `npm test`

### Step 5 — Mark done

Update the task's Status to `done` in TASKS.md and report a summary to the user.

---

## Task file format (TASKS.md)

```
## TXXX · Title
- **Status**: `pending` | `in-progress` | `done` | `blocked`
- **Priority**: high | medium | low
- **Requisites**: none | T001, T002, ...
- **Description**: ...
- **Acceptance Criteria**:
  - [ ] ...
- **Notes**: ...
```

New tasks should be appended to `TASKS.md` following the same format.
