from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "Medium"
    deadline: Optional[str] = None
    status: Optional[str] = "Pending"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None

class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True

# Assistant Schemas
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sql_query: Optional[str] = None

class ConfigRequest(BaseModel):
    provider: str
    model_name: Optional[str] = None

class ConfigResponse(BaseModel):
    status: str
    provider: str
    model: Optional[str]

# Analytics Schemas
class AnalyticsResponse(BaseModel):
    stats: str
    chart_path: Optional[str] = None
