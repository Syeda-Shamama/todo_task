# speckit.specify — Hackathon Todo App
# WHAT: Requirements, User Journeys & Acceptance Criteria
# Hierarchy: Constitution > Specify > Plan > Tasks

---

## §1. Project Overview

A full-stack todo web application built spec-first for Hackathon II.
Users can sign up, sign in, and manage their personal tasks via a responsive web UI.
All data is private per user. Authentication is enforced on every operation.

**Current Phase**: Phase II — Full-Stack Web Application
**Stack**: Next.js 16+ · Python FastAPI · SQLModel · Neon PostgreSQL · Better Auth (JWT)

---

## §2. Features & User Journeys

### §2.1 User Authentication

**Journey: Sign Up**
1. User navigates to `/signup`
2. User enters name, email, and password
3. Better Auth creates account and issues JWT token
4. User is redirected to `/tasks` dashboard

**Journey: Sign In**
1. User navigates to `/login`
2. User enters email and password
3. Better Auth validates credentials and issues JWT token
4. User is redirected to `/tasks` dashboard

**Journey: Sign Out**
1. User clicks "Sign Out"
2. JWT token is invalidated client-side
3. User is redirected to `/login`

**Acceptance Criteria**
- Email must be unique across all users
- Password minimum: 8 characters
- Invalid credentials return a clear error message
- Authenticated JWT is attached to all subsequent API requests as `Authorization: Bearer <token>`
- Unauthenticated requests to protected routes redirect to `/login`
- `BETTER_AUTH_SECRET` env var must be shared between frontend and backend

---

### §2.2 Task CRUD

**Journey: Create Task**
1. Authenticated user clicks "New Task"
2. User fills in title (required) and description (optional)
3. User submits — task is saved and appears in the list

**Journey: View Tasks**
1. Authenticated user visits `/tasks`
2. All tasks belonging to the current user are displayed
3. User can filter by status (all / pending / completed)
4. User can sort by created date, title, or due date

**Journey: Update Task**
1. User clicks a task to open edit view
2. User edits title and/or description
3. User saves — task is updated in place

**Journey: Delete Task**
1. User clicks delete on a task
2. Confirmation is shown
3. User confirms — task is permanently removed

**Journey: Toggle Completion**
1. User clicks the completion checkbox/button on a task
2. Task `completed` field is toggled immediately
3. UI reflects the new state

**Acceptance Criteria**

| Rule | Detail |
|------|--------|
| Title required | 1–200 characters |
| Description optional | Max 1000 characters |
| User isolation | Users only see their own tasks |
| Ownership enforced | Every read/write/delete checks user_id |
| Status filter | all · pending · completed |
| Sort options | created · title · due_date |
| Timestamps | `created_at` and `updated_at` auto-managed |

---

### §2.3 Task Filtering & Sorting (Phase II UI)

- Default view: all tasks, sorted by `created_at` descending
- Filter control: dropdown or tabs (All / Pending / Completed)
- Sort control: dropdown (Newest / Title A–Z / Due Date)
- Filter and sort are combinable
- State persists across page navigation within the session

---

## §3. Domain Rules

1. A task always belongs to exactly one user (`user_id` is non-nullable)
2. `completed` defaults to `false` on creation
3. `updated_at` is refreshed on every write operation
4. Deleting a user cascades to delete all their tasks
5. No task sharing between users (no multi-user ownership)
6. All API responses are filtered to the requesting user's data only

---

## §4. Business Constraints

- No task sharing or collaboration in Phase II
- No file attachments
- No due dates in Phase II (field reserved for future use)
- Authentication required before any task operation
- All API endpoints scoped to `{user_id}` in the URL path
- Backend and frontend must share `BETTER_AUTH_SECRET` for JWT verification

---

## §5. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Responsiveness | Mobile-first, works on all screen sizes |
| Security | JWT expiry enforced; stateless auth; user isolation |
| Performance | Task list loads within 2s on standard connection |
| Accessibility | Semantic HTML, keyboard navigable |
| Error handling | All API errors return JSON with meaningful message |

---

## §6. Out of Scope (Phase II)

- AI Chatbot (Phase III)
- Due dates / reminders
- Task priority levels
- File uploads
- Team/shared workspaces
- Email notifications
