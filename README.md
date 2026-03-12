# Todo App - Hackathon II

A full-stack todo application built with Next.js and FastAPI.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Better Auth |
| Backend  | FastAPI, SQLModel, Neon PostgreSQL  |
| Auth     | Better Auth (JWT)                   |
| Infra    | Docker, docker-compose              |

## Features

- User authentication (sign up, login, sign out)
- Create, view, update, and delete tasks
- Mark tasks as complete
- Filter tasks by status

## Project Structure

```
my_app/
├── frontend/          # Next.js 15 app
│   ├── app/           # Pages and layouts (App Router)
│   ├── components/    # Reusable UI components
│   └── lib/           # API client and utilities
├── backend/           # FastAPI server
│   ├── main.py        # App entry point
│   ├── models.py      # SQLModel database models
│   ├── schemas.py     # Pydantic request/response schemas
│   ├── db.py          # Database connection
│   ├── auth.py        # Auth middleware
│   └── routes/        # API route handlers
├── specs/             # Spec-driven development artifacts
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker & docker-compose, **or**
- Node.js 18+ and Python 3.11+

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host/dbname
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run with Docker

```bash
docker-compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Run Locally

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| GET    | /health           | Health check       |
| GET    | /api/tasks        | List user tasks    |
| POST   | /api/tasks        | Create a task      |
| PUT    | /api/tasks/{id}   | Update a task      |
| DELETE | /api/tasks/{id}   | Delete a task      |
