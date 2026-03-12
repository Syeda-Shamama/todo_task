# [Task]: T-009
# [From]: speckit.plan §3.3

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title:       str           = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)


class TaskUpdate(BaseModel):
    title:       Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)


class TaskResponse(BaseModel):
    id:          int
    user_id:     str
    title:       str
    description: Optional[str]
    completed:   bool
    created_at:  datetime
    updated_at:  datetime

    model_config = {"from_attributes": True}


class ErrorResponse(BaseModel):
    detail: str
