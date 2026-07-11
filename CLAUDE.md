# Habit Tracker

React + Vite + TypeScript habit tracking web app.

## Tech stack

- **Runtime**: React 18 + TypeScript
- **Bundler**: Vite
- **Tests**: Vitest + React Testing Library (jsdom)
- **State**: Zustand (added in T002)
- **Path alias**: `@/` → `src/`

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
- Read the task spec (description + acceptance criteria)
- Produce a **comprehensive implementation plan** covering:
  - Files to create or modify (with paths)
  - TypeScript interfaces / function signatures
  - Test cases to write first (TDD — one test case per acceptance criterion)
  - Implementation steps in order
  - Edge cases to handle

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
