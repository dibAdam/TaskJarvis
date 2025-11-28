"""Pydantic schemas for workspace operations"""

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class WorkspaceCreate(BaseModel):
    """Schema for creating a workspace"""
    name: str
    description: Optional[str] = ""


class WorkspaceResponse(BaseModel):
    """Schema for workspace response"""
    id: int
    name: str
    description: str
    owner_id: int
    created_at: datetime
    member_count: Optional[int] = None

    class Config:
        from_attributes = True


class WorkspaceInvite(BaseModel):
    """Schema for inviting a user to workspace"""
    email: str


class InvitationTokenResponse(BaseModel):
    """Schema for invitation token response"""
    token: str
    workspace_id: int
    expires_at: datetime


class WorkspaceMemberResponse(BaseModel):
    """Schema for workspace member"""
    id: int
    user_id: int
    username: str
    email: str
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True
