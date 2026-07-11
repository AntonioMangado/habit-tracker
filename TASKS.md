# Habit Tracker — Task Board

Tasks are processed in order. A task is eligible when all its **Requisites** are `done`.

## Status legend

| Value         | Meaning                              |
| ------------- | ------------------------------------ |
| `pending`     | Not started, waiting to be picked up |
| `in-progress` | Currently being implemented          |
| `done`        | Completed and reviewed               |
| `blocked`     | Waiting on something external        |

---

## T001 · Project setup and tooling

- **Status**: `done`
- **Priority**: high
- **Requisites**: none
- **Description**: Clean up Vite boilerplate, configure ESLint + Prettier, confirm Vitest runs, and add the `@/` path alias to TypeScript.
- **Acceptance Criteria**:
  - [x] `npm test` exits with 0 (at least one passing smoke test)
  - [x] `npm run lint` exits with 0
  - [x] `src/App.tsx` contains no boilerplate (Vite logo, counter, etc.)
  - [x] `tsconfig.app.json` has `paths: { "@/*": ["./src/*"] }`
- **Notes**: Keep `main.tsx` and the global CSS reset; remove everything else from the boilerplate.

---

## T002 · Data models and persistence layer

- **Status**: `pending`
- **Priority**: high
- **Requisites**: T001
- **Description**: Define all TypeScript types and a Zustand store that persists to localStorage. This is the single source of truth for the whole app.
- **Acceptance Criteria**:
  - [ ] `Habit` type: `id`, `name`, `description`, `color`, `frequency` (`daily` | `weekly`), `createdAt`
  - [ ] `HabitEntry` type: `id`, `habitId`, `date` (ISO `YYYY-MM-DD`), `completedAt`
  - [ ] Store actions: `addHabit`, `updateHabit`, `deleteHabit`, `toggleEntry(habitId, date)`
  - [ ] Store rehydrates from localStorage on load
  - [ ] Unit tests cover every store action and rehydration
- **Notes**: Use Zustand + zustand/middleware `persist`. Install as a dependency.

---

## T003 · Habit list view

- **Status**: `pending`
- **Priority**: high
- **Requisites**: T002
- **Description**: Build the main screen that lists all habits. Each row shows the habit name, color indicator, and today's check-in toggle.
- **Acceptance Criteria**:
  - [ ] Empty state message when no habits exist
  - [ ] Each habit renders name + color swatch
  - [ ] Clicking the toggle calls `toggleEntry` for today's date
  - [ ] Completed habits are visually distinct (strikethrough or checkmark)
  - [ ] Component tests cover empty state, list render, and toggle interaction
- **Notes**: No routing yet — this is the only screen for now.

---

## T004 · Add / Edit habit modal

- **Status**: `pending`
- **Priority**: high
- **Requisites**: T003
- **Description**: A modal form for creating and editing habits. Fields: name (required), description (optional), color picker (preset swatches), frequency.
- **Acceptance Criteria**:
  - [ ] "Add habit" button opens modal
  - [ ] Form validates: name must not be empty
  - [ ] Submitting calls `addHabit` and closes modal
  - [ ] Clicking a habit's edit icon pre-fills the form and calls `updateHabit` on submit
  - [ ] Escape key and backdrop click close the modal without saving
  - [ ] Component tests cover validation, add, and edit flows
- **Notes**: —

---

## T005 · Delete habit with confirmation

- **Status**: `pending`
- **Priority**: medium
- **Requisites**: T004
- **Description**: Allow deleting a habit. Show a confirmation dialog before calling `deleteHabit` (which also removes all related entries).
- **Acceptance Criteria**:
  - [ ] Delete button visible on each habit row (or in edit modal)
  - [ ] Confirmation dialog appears before deletion
  - [ ] Confirming removes habit and all its entries from the store
  - [ ] Cancelling leaves data untouched
  - [ ] Tests cover confirm and cancel paths
- **Notes**: —

---

## T006 · Weekly streak view

- **Status**: `pending`
- **Priority**: medium
- **Requisites**: T002
- **Description**: For each habit, display the last 7 days as a row of day cells (Mon–Sun). Completed days are filled, missed days are empty.
- **Acceptance Criteria**:
  - [ ] Correct days rendered relative to today
  - [ ] Cells reflect actual entries in the store
  - [ ] Current day is visually highlighted
  - [ ] Unit tests verify cell computation logic with mocked dates
- **Notes**: Extract pure date-computation logic into a utility and test it independently.
