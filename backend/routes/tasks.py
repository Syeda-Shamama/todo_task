# [Task]: T-010, T-011, T-012, T-013, T-014, T-015
# [From]: speckit.plan §3.2, §3.3, speckit.specify §2.2, §2.3

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlmodel import Session, select

from db import get_session
from models import Task
from schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter()


def verify_user(request: Request, user_id: str):
    """Ensure the JWT user matches the URL user_id."""
    if request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")


def get_task_or_404(session: Session, task_id: int, user_id: str) -> Task:
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


# T-010 · GET /api/{user_id}/tasks
@router.get("/{user_id}/tasks", response_model=list[TaskResponse])
def list_tasks(
    user_id: str,
    request: Request,
    status: Optional[str] = Query(default="all", pattern="^(all|pending|completed)$"),
    sort: Optional[str] = Query(default="created", pattern="^(created|title|due_date)$"),
    session: Session = Depends(get_session),
):
    verify_user(request, user_id)

    statement = select(Task).where(Task.user_id == user_id)

    if status == "pending":
        statement = statement.where(Task.completed == False)
    elif status == "completed":
        statement = statement.where(Task.completed == True)

    if sort == "title":
        statement = statement.order_by(Task.title.asc())
    else:
        statement = statement.order_by(Task.created_at.desc())

    return session.exec(statement).all()


# T-011 · POST /api/{user_id}/tasks
@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=201)
def create_task(
    user_id: str,
    body: TaskCreate,
    request: Request,
    session: Session = Depends(get_session),
):
    verify_user(request, user_id)
    now = datetime.utcnow()
    task = Task(
        user_id=user_id,
        title=body.title,
        description=body.description,
        completed=False,
        created_at=now,
        updated_at=now,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# T-012 · GET /api/{user_id}/tasks/{id}
@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    user_id: str,
    task_id: int,
    request: Request,
    session: Session = Depends(get_session),
):
    verify_user(request, user_id)
    return get_task_or_404(session, task_id, user_id)


# T-013 · PUT /api/{user_id}/tasks/{id}
@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    user_id: str,
    task_id: int,
    body: TaskUpdate,
    request: Request,
    session: Session = Depends(get_session),
):
    verify_user(request, user_id)
    task = get_task_or_404(session, task_id, user_id)

    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# T-014 · DELETE /api/{user_id}/tasks/{id}
@router.delete("/{user_id}/tasks/{task_id}", status_code=204)
def delete_task(
    user_id: str,
    task_id: int,
    request: Request,
    session: Session = Depends(get_session),
):
    verify_user(request, user_id)
    task = get_task_or_404(session, task_id, user_id)
    session.delete(task)
    session.commit()


# T-015 · PATCH /api/{user_id}/tasks/{id}/complete
@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
def toggle_complete(
    user_id: str,
    task_id: int,
    request: Request,
    session: Session = Depends(get_session),
):
    verify_user(request, user_id)
    task = get_task_or_404(session, task_id, user_id)
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
