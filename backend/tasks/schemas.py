"""Pydantic schemas for task operations"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TaskBase(BaseModel):
    """Base task schema"""
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "Medium"
    deadline: Optional[datetime] = None
    status: Optional[str] = "Pending"


class TaskCreate(TaskBase):
    """Schema for creating a task"""
    workspace_id: Optional[int] = None
    assigned_to_id: Optional[int] = None


class TaskUpdate(BaseModel):
    """Schema for updating a task"""
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None


class TaskResponse(TaskBase):
    """Schema for task response"""
    id: int
    user_id: Optional[int] = None
    workspace_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskExport(BaseModel):
    """Schema for task export"""
    tasks: list[TaskResponse]


class TaskImport(BaseModel):
    """Schema for task import"""
    tasks: list[TaskCreate]
