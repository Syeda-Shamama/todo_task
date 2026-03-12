# [Task]: T-004
# [From]: speckit.plan §4.2, speckit.specify §3

from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Task(SQLModel, table=True):
    id:          Optional[int] = Field(default=None, primary_key=True)
    user_id:     str           = Field(index=True)
    title:       str           = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed:   bool          = Field(default=False, index=True)
    created_at:  datetime      = Field(default_factory=datetime.utcnow)
    updated_at:  datetime      = Field(default_factory=datetime.utcnow)
