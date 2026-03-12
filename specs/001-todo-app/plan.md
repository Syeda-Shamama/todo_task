# speckit.plan — Hackathon Todo App
# HOW: Architecture, Components, Interfaces & System Responsibilities
# Generated from: speckit.specify
# Hierarchy: Constitution > Specify > Plan > Tasks

---

## §1. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser Client                    │
│          Next.js 16+ (App Router, TypeScript)        │
│                  Tailwind CSS UI                     │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS + JWT (Authorization: Bearer)
┌──────────────────────▼──────────────────────────────┐
│               Python FastAPI Backend                 │
│         JWT Middleware → Route Handlers              │
│              Pydantic Validation                     │
└──────────────────────┬──────────────────────────────┘
                       │ SQLModel ORM
┌──────────────────────▼──────────────────────────────┐
│           Neon Serverless PostgreSQL                 │
│              users · tasks tables                    │
└─────────────────────────────────────────────────────┘

Auth Flow (separate):
Browser ──► Better Auth (Next.js) ──► issues JWT
Browser ──► FastAPI ──► verifies JWT via BETTER_AUTH_SECRET
```

---

## §2. Component Breakdown

### §2.1 Frontend Components

| Component | Type | Responsibility |
|-----------|------|---------------|
| `/app/layout.tsx` | Server | Root layout, auth session provider |
| `/app/page.tsx` | Server | Landing / redirect to /tasks or /login |
| `/app/login/page.tsx` | Client | Sign-in form, calls Better Auth |
| `/app/signup/page.tsx` | Client | Sign-up form, calls Better Auth |
| `/app/tasks/page.tsx` | Server | Task list page, fetches tasks server-side |
| `/app/tasks/[id]/page.tsx` | Server | Task detail / edit page |
| `/components/TaskCard.tsx` | Client | Single task display with toggle & delete |
| `/components/TaskForm.tsx` | Client | Create / edit task form |
| `/components/TaskList.tsx` | Client | Renders list of TaskCards |
| `/components/FilterBar.tsx` | Client | Status filter + sort controls |
| `/components/NavBar.tsx` | Server | Top nav with user info and sign-out |
| `/lib/api.ts` | Utility | All backend API calls (attaches JWT) |
| `/lib/auth.ts` | Utility | Better Auth client setup |

### §2.2 Backend Components

| File/Module | Responsibility |
|-------------|---------------|
| `main.py` | FastAPI app init, middleware registration, router mounting |
| `db.py` | Neon PostgreSQL connection via `DATABASE_URL` env var |
| `models.py` | SQLModel models: `User`, `Task` |
| `auth.py` | JWT verification middleware using `BETTER_AUTH_SECRET` |
| `routes/tasks.py` | Task CRUD route handlers |
| `schemas.py` | Pydantic request/response schemas |

---

## §3. API Design

### §3.1 Authentication Middleware
All routes except health check require JWT.
Middleware extracts `Authorization: Bearer <token>`, verifies signature,
injects `current_user_id` into request state.

### §3.2 Endpoints

| Method | Path | Handler | Spec Ref |
|--------|------|---------|----------|
| GET | `/api/{user_id}/tasks` | `list_tasks` | §2.2, §2.3 |
| POST | `/api/{user_id}/tasks` | `create_task` | §2.2 |
| GET | `/api/{user_id}/tasks/{id}` | `get_task` | §2.2 |
| PUT | `/api/{user_id}/tasks/{id}` | `update_task` | §2.2 |
| DELETE | `/api/{user_id}/tasks/{id}` | `delete_task` | §2.2 |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | `toggle_complete` | §2.2 |

### §3.3 Request / Response Schemas

**TaskCreate** (POST body)
```json
{
  "title": "string (required, 1-200 chars)",
  "description": "string (optional, max 1000 chars)"
}
```

**TaskUpdate** (PUT body)
```json
{
  "title": "string (optional)",
  "description": "string (optional)"
}
```

**Task** (response)
```json
{
  "id": "integer",
  "user_id": "string",
  "title": "string",
  "description": "string | null",
  "completed": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Error**
```json
{
  "detail": "string"
}
```

### §3.4 Query Parameters (GET /api/{user_id}/tasks)

| Param | Values | Default |
|-------|--------|---------|
| `status` | `all` \| `pending` \| `completed` | `all` |
| `sort` | `created` \| `title` \| `due_date` | `created` |

---

## §4. Database Design

### §4.1 Schema

```sql
-- Managed by Better Auth
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT CHECK (char_length(description) <= 1000),
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id  ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

### §4.2 SQLModel Models (`models.py`)

```python
class Task(SQLModel, table=True):
    id:          Optional[int] = Field(default=None, primary_key=True)
    user_id:     str           = Field(foreign_key="users.id", index=True)
    title:       str           = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed:   bool          = Field(default=False, index=True)
    created_at:  datetime      = Field(default_factory=datetime.utcnow)
    updated_at:  datetime      = Field(default_factory=datetime.utcnow)
```

---

## §5. Authentication Design

### §5.1 Frontend (Better Auth)
- Install Better Auth with JWT plugin in Next.js
- On login/signup → Better Auth issues JWT signed with `BETTER_AUTH_SECRET`
- Store JWT in httpOnly cookie or memory (not localStorage)
- `/lib/auth.ts` exposes `getSession()`, `signIn()`, `signUp()`, `signOut()`
- `/lib/api.ts` reads JWT from session and sets `Authorization` header on every request

### §5.2 Backend (FastAPI)
- `auth.py` middleware reads `Authorization: Bearer <token>`
- Verifies JWT signature using `BETTER_AUTH_SECRET` (env var)
- Decodes payload → extracts `user_id`
- Injects into `request.state.user_id`
- Returns `401` if token missing, expired, or invalid

### §5.3 Security Rules
- `BETTER_AUTH_SECRET` never committed to source control (env var only)
- Backend validates that URL `{user_id}` matches JWT `user_id` on every request
- Token expiry: 7 days (configurable via Better Auth)

---

## §6. Frontend Page & Navigation Flow

```
/               → redirect based on auth state
  ├─ (unauth)  → /login
  └─ (auth)    → /tasks

/login          → sign-in form → on success → /tasks
/signup         → sign-up form → on success → /tasks

/tasks          → task list (filter + sort controls)
  └─ /tasks/new       → create task form
  └─ /tasks/[id]      → task detail + edit form
```

---

## §7. Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | Backend | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Both | JWT signing/verification shared secret |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend base URL |

---

## §8. Service Boundaries & Responsibilities

| Concern | Owner |
|---------|-------|
| Session management | Better Auth (frontend) |
| JWT issuance | Better Auth (frontend) |
| JWT verification | FastAPI middleware (backend) |
| Data persistence | FastAPI + SQLModel (backend) |
| UI rendering | Next.js (frontend) |
| User isolation enforcement | FastAPI route handlers |
