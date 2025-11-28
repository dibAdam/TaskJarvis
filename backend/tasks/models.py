"""Updated Task model with multi-user support"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.database.base import Base, TimestampMixin
from datetime import datetime


class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    priority = Column(String, default="Medium")
    deadline = Column(DateTime, nullable=True)
    status = Column(String, default="Pending")

    # Recurrence & Reminders
    recurrence_rule = Column(String, nullable=True)
    reminder_offset = Column(Integer, nullable=True)
    last_reminded_at = Column(DateTime, nullable=True)
    
    # Multi-user fields
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for backward compat
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    last_synced_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    workspace = relationship("Workspace", back_populates="tasks")
