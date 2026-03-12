# speckit.tasks — Hackathon Todo App
# BREAKDOWN: Atomic, Testable Work Units
# Generated from: speckit.specify + speckit.plan
# Hierarchy: Constitution > Specify > Plan > Tasks
# Rule: No task = No code. Every implementation must reference a Task ID.

---

## Phase: phase2-web
## Status Legend: [ ] pending | [x] done | [~] in-progress

---

## EPIC 1 — Project Setup & Infrastructure

### T-001 · Initialize Backend Project
**Spec**: speckit.plan §2.2, §7
**Preconditions**: Python 3.11+ installed
**Artifacts**: `backend/main.py`, `backend/db.py`, `backend/requirements.txt`
**Description**:
- Create FastAPI app in `backend/main.py`
- Set up Neon PostgreSQL connection in `backend/db.py` using `DATABASE_URL` env var
- Add `requirements.txt`: fastapi, uvicorn, sqlmodel, python-jose, python-dotenv, asyncpg
- Add `.env.example` with `DATABASE_URL` and `BETTER_AUTH_SECRET`
**Expected Output**: `uvicorn main:app --reload` starts without errors
**Status**: [x]

---

### T-002 · Initialize Frontend Project
**Spec**: speckit.plan §2.1, §7
**Preconditions**: Node.js 18+ installed
**Artifacts**: `frontend/` (Next.js scaffold), `frontend/lib/api.ts`, `frontend/lib/auth.ts`
**Description**:
- Scaffold Next.js 16+ app with App Router, TypeScript, Tailwind CSS in `frontend/`
- Install Better Auth: `npm install better-auth`
- Create `/lib/auth.ts` — Better Auth client config with JWT plugin
- Create `/lib/api.ts` — base API client that attaches `Authorization: Bearer <token>` to all requests
- Add `.env.local.example` with `BETTER_AUTH_SECRET` and `NEXT_PUBLIC_API_URL`
**Expected Output**: `npm run dev` starts; `/` route renders without errors
**Status**: [x]

---

### T-003 · Docker Compose Setup
**Spec**: speckit.plan §7, CLAUDE.md commands
**Preconditions**: T-001, T-002 complete
**Artifacts**: `docker-compose.yml`
**Description**:
- Define `frontend` service (Next.js, port 3000)
- Define `backend` service (FastAPI, port 8000)
- Wire env vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_API_URL`
**Expected Output**: `docker-compose up` starts both services
**Status**: [x]

---

## EPIC 2 — Database & Models

### T-004 · Define SQLModel Database Models
**Spec**: speckit.plan §4.2, speckit.specify §3
**Preconditions**: T-001 complete
**Artifacts**: `backend/models.py`
**Description**:
- Define `Task` SQLModel table model with fields: `id`, `user_id`, `title`, `description`, `completed`, `created_at`, `updated_at`
- Add field constraints: title 1–200 chars, description max 1000 chars
- Add indexes on `user_id` and `completed`
- `updated_at` auto-updates on every write
**Expected Output**: Model imports cleanly; table creation SQL matches speckit.plan §4.1
**Status**: [x]

---

### T-005 · Database Migration / Table Creation
**Spec**: speckit.plan §4.1
**Preconditions**: T-004 complete, `DATABASE_URL` configured
**Artifacts**: `backend/db.py` (updated with `create_db_and_tables()`)
**Description**:
- Use SQLModel `SQLModel.metadata.create_all(engine)` on app startup
- Verify `users` table exists (Better Auth manages it)
- Verify `tasks` table is created with correct schema and indexes
**Expected Output**: Tables exist in Neon PostgreSQL; app starts without migration errors
**Status**: [x]

---

## EPIC 3 — Authentication

### T-006 · Backend JWT Verification Middleware
**Spec**: speckit.plan §5.2, speckit.specify §2.1
**Preconditions**: T-001 complete
**Artifacts**: `backend/auth.py`
**Description**:
- Create FastAPI middleware in `auth.py`
- Read `Authorization: Bearer <token>` header
- Verify JWT signature using `BETTER_AUTH_SECRET` (python-jose)
- Decode payload, extract `user_id`
- Inject `request.state.user_id` for route handlers
- Return `401 Unauthorized` (JSON) if token missing, invalid, or expired
- Exclude `/docs`, `/openapi.json`, `/health` from auth check
**Expected Output**: Request with valid JWT passes; request without JWT returns `{"detail": "Unauthorized"}`
**Status**: [x]

---

### T-007 · Better Auth Frontend Setup (Sign Up & Sign In)
**Spec**: speckit.plan §5.1, speckit.specify §2.1
**Preconditions**: T-002 complete
**Artifacts**: `frontend/lib/auth.ts`, `frontend/app/signup/page.tsx`, `frontend/app/login/page.tsx`
**Description**:
- Configure Better Auth client with JWT plugin in `lib/auth.ts`
- Build `/signup/page.tsx`: name, email, password form → calls `auth.signUp()` → redirect to `/tasks`
- Build `/login/page.tsx`: email, password form → calls `auth.signIn()` → redirect to `/tasks`
- Show error messages on invalid credentials
- Password minimum: 8 characters (client-side validation)
**Expected Output**: User can sign up and sign in; JWT is issued and stored; redirects work
**Status**: [x]

---

### T-008 · Auth Session Provider & Protected Routes
**Spec**: speckit.plan §6, speckit.specify §2.1
**Preconditions**: T-007 complete
**Artifacts**: `frontend/app/layout.tsx`, `frontend/middleware.ts`
**Description**:
- Wrap app in Better Auth session provider in `layout.tsx`
- Add Next.js `middleware.ts` to protect `/tasks` and `/tasks/**` routes
- Unauthenticated access to protected routes → redirect to `/login`
- Authenticated access to `/login` or `/signup` → redirect to `/tasks`
- Add Sign Out button in `NavBar.tsx` → calls `auth.signOut()` → redirect to `/login`
**Expected Output**: Unauthenticated users cannot access `/tasks`; session persists on refresh
**Status**: [x]

---

## EPIC 4 — Backend Task API

### T-009 · Define Pydantic Schemas
**Spec**: speckit.plan §3.3
**Preconditions**: T-004 complete
**Artifacts**: `backend/schemas.py`
**Description**:
- `TaskCreate`: `title` (str, required), `description` (str, optional)
- `TaskUpdate`: `title` (str, optional), `description` (str, optional)
- `TaskResponse`: all Task fields as response model
- `ErrorResponse`: `detail: str`
**Expected Output**: Schemas import cleanly; validation rejects out-of-range values
**Status**: [x]

---

### T-010 · Implement GET /api/{user_id}/tasks
**Spec**: speckit.plan §3.2, speckit.specify §2.2, §2.3
**Preconditions**: T-005, T-006, T-009 complete
**Artifacts**: `backend/routes/tasks.py`
**Description**:
- Verify URL `user_id` matches `request.state.user_id` → else `403 Forbidden`
- Query tasks filtered by `user_id`
- Apply `status` filter: `pending` = completed false, `completed` = completed true, `all` = no filter
- Apply `sort`: `created` = order by `created_at` DESC, `title` = order by `title` ASC, `due_date` = reserved (use `created_at` for now)
- Return array of `TaskResponse`
**Expected Output**: Returns only current user's tasks; filters and sort work correctly
**Status**: [x]

---

### T-011 · Implement POST /api/{user_id}/tasks
**Spec**: speckit.plan §3.2, §3.3, speckit.specify §2.2
**Preconditions**: T-010 complete
**Artifacts**: `backend/routes/tasks.py`
**Description**:
- Verify `user_id` matches JWT user → else `403`
- Validate `TaskCreate` body
- Set `user_id`, `completed=false`, `created_at`, `updated_at` automatically
- Save to DB, return `TaskResponse` with `201 Created`
**Expected Output**: Task created and returned; `user_id` always set from JWT, not client
**Status**: [x]

---

### T-012 · Implement GET /api/{user_id}/tasks/{id}
**Spec**: speckit.plan §3.2
**Preconditions**: T-011 complete
**Artifacts**: `backend/routes/tasks.py`
**Description**:
- Verify `user_id` matches JWT user → else `403`
- Fetch task by `id` WHERE `user_id` matches → else `404`
- Return `TaskResponse`
**Expected Output**: Returns task if owned by user; 404 if not found; 403 if wrong user
**Status**: [x]

---

### T-013 · Implement PUT /api/{user_id}/tasks/{id}
**Spec**: speckit.plan §3.2, §3.3
**Preconditions**: T-012 complete
**Artifacts**: `backend/routes/tasks.py`
**Description**:
- Verify ownership (user_id + task id) → else `403` / `404`
- Apply `TaskUpdate` fields (only provided fields updated)
- Refresh `updated_at` to current timestamp
- Return updated `TaskResponse`
**Expected Output**: Task fields updated; `updated_at` refreshed; unchanged fields preserved
**Status**: [x]

---

### T-014 · Implement DELETE /api/{user_id}/tasks/{id}
**Spec**: speckit.plan §3.2
**Preconditions**: T-012 complete
**Artifacts**: `backend/routes/tasks.py`
**Description**:
- Verify ownership → else `403` / `404`
- Delete task from DB
- Return `204 No Content`
**Expected Output**: Task deleted; subsequent GET returns `404`
**Status**: [x]

---

### T-015 · Implement PATCH /api/{user_id}/tasks/{id}/complete
**Spec**: speckit.plan §3.2, speckit.specify §2.2
**Preconditions**: T-012 complete
**Artifacts**: `backend/routes/tasks.py`
**Description**:
- Verify ownership → else `403` / `404`
- Toggle `completed` field (true → false, false → true)
- Refresh `updated_at`
- Return updated `TaskResponse`
**Expected Output**: `completed` toggles on each call; `updated_at` always refreshed
**Status**: [x]

---

### T-016 · Mount Task Router in main.py
**Spec**: speckit.plan §2.2
**Preconditions**: T-010–T-015 complete
**Artifacts**: `backend/main.py`
**Description**:
- Import and mount `routes/tasks.py` router with prefix `/api`
- Register auth middleware from `auth.py`
- Add `/health` GET endpoint (returns `{"status": "ok"}`, no auth required)
**Expected Output**: All task routes reachable; health endpoint responds without JWT
**Status**: [x]

---

## EPIC 5 — Frontend Task UI

### T-017 · Build NavBar Component
**Spec**: speckit.plan §2.1, §6
**Preconditions**: T-008 complete
**Artifacts**: `frontend/components/NavBar.tsx`
**Description**:
- Display app name/logo
- Show signed-in user's name/email
- Sign Out button → `auth.signOut()` → redirect to `/login`
- Server component (reads session server-side)
**Expected Output**: NavBar renders on all protected pages; sign-out works
**Status**: [x]

---

### T-018 · Build FilterBar Component
**Spec**: speckit.plan §2.1, speckit.specify §2.3
**Preconditions**: T-002 complete
**Artifacts**: `frontend/components/FilterBar.tsx`
**Description**:
- Client component
- Status filter: All / Pending / Completed (tabs or dropdown)
- Sort control: Newest / Title A–Z / Due Date (dropdown)
- Emits `onFilterChange(status, sort)` callback
- Default: status=all, sort=created
**Expected Output**: Controls render; callbacks fire with correct values on change
**Status**: [x]

---

### T-019 · Build TaskCard Component
**Spec**: speckit.plan §2.1, speckit.specify §2.2
**Preconditions**: T-002 complete
**Artifacts**: `frontend/components/TaskCard.tsx`
**Description**:
- Client component
- Display: title, description (truncated), status badge, created date
- Completion toggle checkbox/button → calls `api.toggleComplete(id)`
- Delete button → confirm dialog → calls `api.deleteTask(id)`
- Edit link → navigates to `/tasks/[id]`
- Visual distinction between completed and pending tasks
**Expected Output**: Card renders task data; toggle and delete call correct API endpoints
**Status**: [x]

---

### T-020 · Build TaskForm Component
**Spec**: speckit.plan §2.1, speckit.specify §2.2
**Preconditions**: T-002 complete
**Artifacts**: `frontend/components/TaskForm.tsx`
**Description**:
- Client component
- Fields: title (required, 1–200 chars), description (optional, max 1000 chars)
- Client-side validation with error messages
- Submit → calls `api.createTask()` or `api.updateTask()` depending on mode
- Cancel button → navigates back
**Expected Output**: Form validates before submit; API called with correct payload
**Status**: [x]

---

### T-021 · Build Task List Page (/tasks)
**Spec**: speckit.plan §2.1, §6, speckit.specify §2.2, §2.3
**Preconditions**: T-017, T-018, T-019 complete, T-010 complete
**Artifacts**: `frontend/app/tasks/page.tsx`, `frontend/components/TaskList.tsx`
**Description**:
- Server component — fetch tasks on server using session JWT
- Pass tasks to `TaskList` client component
- `TaskList` renders `FilterBar` + list of `TaskCards`
- Filter/sort changes re-fetch tasks via `api.getTasks(status, sort)`
- "New Task" button → `/tasks/new`
- Empty state: "No tasks yet. Create your first task."
**Expected Output**: Tasks load and display; filter/sort update the list; empty state shown when no tasks
**Status**: [x]

---

### T-022 · Build Create Task Page (/tasks/new)
**Spec**: speckit.plan §6, speckit.specify §2.2
**Preconditions**: T-020 complete, T-011 complete
**Artifacts**: `frontend/app/tasks/new/page.tsx`
**Description**:
- Render `TaskForm` in create mode
- On submit → `api.createTask(title, description)` → redirect to `/tasks`
- On cancel → redirect to `/tasks`
**Expected Output**: Task created in DB; user redirected to task list; new task appears
**Status**: [x]

---

### T-023 · Build Edit Task Page (/tasks/[id])
**Spec**: speckit.plan §6, speckit.specify §2.2
**Preconditions**: T-020 complete, T-012, T-013 complete
**Artifacts**: `frontend/app/tasks/[id]/page.tsx`
**Description**:
- Server component — fetch task by ID on server
- Return `404` page if task not found or not owned by user
- Render `TaskForm` pre-filled with existing values
- On submit → `api.updateTask(id, title, description)` → redirect to `/tasks`
**Expected Output**: Form pre-filled; task updated in DB; redirected to list
**Status**: [x]

---

### T-024 · Wire API Client (`/lib/api.ts`)
**Spec**: speckit.plan §3.2, §5.1
**Preconditions**: T-002, T-007 complete
**Artifacts**: `frontend/lib/api.ts`
**Description**:
- All functions attach `Authorization: Bearer <token>` from Better Auth session
- Base URL from `NEXT_PUBLIC_API_URL` env var
- Implement: `getTasks(status?, sort?)`, `createTask(title, description?)`, `getTask(id)`, `updateTask(id, data)`, `deleteTask(id)`, `toggleComplete(id)`
- Handle `401` → redirect to `/login`
- Handle other errors → throw with `detail` message
**Expected Output**: All API functions callable; JWT attached automatically; errors handled uniformly
**Status**: [x]

---

## EPIC 6 — Integration & QA

### T-025 · End-to-End Auth Flow Test
**Spec**: speckit.specify §2.1
**Preconditions**: T-007, T-008, T-016 complete
**Description**:
- Manual test: sign up new user → lands on /tasks
- Sign out → redirected to /login
- Sign in again → lands on /tasks
- Access /tasks without auth → redirected to /login
- Verify JWT is sent on API requests (network tab)
**Expected Output**: All auth journeys pass
**Status**: [x]

---

### T-026 · End-to-End Task CRUD Test
**Spec**: speckit.specify §2.2
**Preconditions**: T-021–T-024 complete
**Description**:
- Create task → appears in list
- Edit task → changes saved
- Toggle complete → status updates
- Delete task → removed from list
- Filter by status → correct tasks shown
- Sort → correct order
- Create two users; verify neither can see the other's tasks
**Expected Output**: All task journeys pass; user isolation confirmed
**Status**: [x]

---

## Task Dependency Order

```
T-001 (backend init)
T-002 (frontend init)
  └─► T-003 (docker-compose)
T-001 ──► T-004 (models) ──► T-005 (migrations)
T-001 ──► T-006 (JWT middleware)
T-002 ──► T-007 (Better Auth UI) ──► T-008 (session/protected routes)
T-005 + T-006 ──► T-009 (schemas) ──► T-010..T-015 (route handlers) ──► T-016 (mount router)
T-008 + T-016 ──► T-017..T-024 (frontend components & pages)
T-016 + T-024 ──► T-025 (auth e2e test)
T-021..T-024 ──► T-026 (crud e2e test)
```

---

**Total Tasks**: 26 | **Epics**: 6 | **Phase**: phase2-web
