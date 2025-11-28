"""Pydantic schemas for user operations"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    """Schema for user login"""
    email_or_username: str
    password: str


class UserResponse(BaseModel):
    """Schema for user response (public info)"""
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
