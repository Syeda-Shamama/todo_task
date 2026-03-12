# Hackathon Todo App Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)
Always read the relevant spec before implementing any feature. Reference specs with `@specs/features/[feature].md`. Never implement without a spec. Update specs if requirements change. The spec is the source of truth.

### II. User Isolation
Every database query and API response must be scoped to the authenticated user. Task ownership is enforced on every operation. No user may read, modify, or delete another user's data.

### III. Stateless Authentication
Better Auth (frontend) issues JWT tokens. FastAPI (backend) verifies JWTs independently using a shared `BETTER_AUTH_SECRET` env var. The backend never calls the frontend to verify sessions. Requests without a valid JWT receive `401 Unauthorized`.

### IV. Monorepo, Single Context
Frontend and backend live in one repo so Claude Code can navigate and edit both in a single context. Cross-cutting changes (auth, schema, API contracts) are easier to keep in sync.

### V. Phase-Gated Delivery
Features are released in phases defined in `.spec-kit/config.yaml`:
- **phase1-console** — task-crud only
- **phase2-web** — task-crud + authentication
- **phase3-chatbot** — task-crud + authentication + chatbot

Only build what the current phase requires. No premature features.

### VI. Simplicity (YAGNI)
Start simple. No over-engineering. Avoid adding features, abstractions, or configurability beyond what the current phase demands.

---

## Technology Stack

| Layer          | Technology                                         |
|----------------|----------------------------------------------------|
| Frontend       | Next.js 16+ (App Router), TypeScript, Tailwind CSS |
| Backend        | Python FastAPI                                     |
| ORM            | SQLModel                                           |
| Database       | Neon Serverless PostgreSQL                         |
| Authentication | Better Auth with JWT plugin                        |
| Spec-Driven    | Claude Code + Spec-Kit Plus                        |

---

## Development Workflow

1. Read spec: `@specs/features/[feature].md`
2. Implement backend following `@backend/CLAUDE.md`
3. Implement frontend following `@frontend/CLAUDE.md`
4. Test and iterate

**Commands**
```bash
cd frontend && npm run dev          # Frontend only
cd backend && uvicorn main:app --reload  # Backend only
docker-compose up                   # Both
```

---

## API Contract

All endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint                           | Description       |
|--------|------------------------------------|-------------------|
| GET    | /api/{user_id}/tasks               | List all tasks    |
| POST   | /api/{user_id}/tasks               | Create a task     |
| GET    | /api/{user_id}/tasks/{id}          | Get task details  |
| PUT    | /api/{user_id}/tasks/{id}          | Update a task     |
| DELETE | /api/{user_id}/tasks/{id}          | Delete a task     |
| PATCH  | /api/{user_id}/tasks/{id}/complete | Toggle completion |

---

## Frontend Standards (`frontend/CLAUDE.md`)

- Server components by default; client components only for interactivity
- All API calls via `/lib/api.ts` — never call the backend directly from components
- Tailwind CSS only — no inline styles
- Structure: `/components` for reusable UI, `/app` for pages and layouts

---

## Backend Standards (`backend/CLAUDE.md`)

- All routes prefixed `/api/`
- JSON responses only
- Pydantic models for all request/response validation
- Errors via `HTTPException`
- DB connection from `DATABASE_URL` env var

| File      | Purpose                  |
|-----------|--------------------------|
| main.py   | FastAPI app entry point  |
| models.py | SQLModel database models |
| routes/   | API route handlers       |
| db.py     | Database connection      |

---

## Database Schema

**users** _(managed by Better Auth)_: `id` (PK), `email` (unique), `name`, `created_at`

**tasks**: `id` (PK), `user_id` (FK→users.id), `title` (not null, 1–200 chars), `description` (nullable, max 1000 chars), `completed` (bool, default false), `created_at`, `updated_at`

Indexes: `tasks.user_id`, `tasks.completed`

---

## Agent Rules (from `AGENTS.md`)

### Mandatory Behaviors
1. **Never generate code without a referenced Task ID**
2. **Never modify architecture without updating `speckit.plan`**
3. **Never propose features without updating `speckit.specify`**
4. **Never change principles without updating `speckit.constitution`**
5. **Every code file must contain a comment linking it to its Task ID and Spec section**

If the required spec cannot be found → **stop and request it. Never improvise.**

### Code Reference Format
```
[Task]: T-001
[From]: speckit.specify §2.1, speckit.plan §3.4
```

### Spec Hierarchy (conflict resolution)
```
Constitution > Specify > Plan > Tasks
```

### Agent Failure Modes (FORBIDDEN)
- Freestyle code or architecture
- Generate missing requirements
- Create tasks autonomously
- Alter stack choices without justification
- Add endpoints, fields, or flows not in the spec
- Ignore acceptance criteria
- Produce implementations that violate the plan

### Before Every Session
Re-read `.memory/constitution.md` to ensure predictable, deterministic development.

---

## Governance

This constitution supersedes all other practices. All implementation decisions must comply with the principles above. Amendments require updating this file and any affected specs. The **spec is the single source of truth** — humans and agents collaborate, but the spec always wins.

**Version**: 1.1.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-03-05
