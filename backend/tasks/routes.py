"""Updated task routes with multi-user support"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.database import get_db
from backend.auth.dependencies import get_current_user
from backend.users.models import User
from backend.tasks.models import Task
from backend.tasks.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskExport, TaskImport
from backend.tasks.sync import sync_task_created, sync_task_updated, sync_task_deleted, sync_task_assigned
from backend.workspaces.models import WorkspaceMember

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _check_workspace_access(db: Session, user_id: int, workspace_id: int) -> bool:
    """Check if user has access to workspace"""
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()
    return membership is not None


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    workspace_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks with optional filtering"""
    query = db.query(Task)
    
    # Filter by user and workspace
    if workspace_id:
        # Check workspace access
        if not _check_workspace_access(db, current_user.id, workspace_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No access to this workspace"
            )
        query = query.filter(Task.workspace_id == workspace_id)
    else:
        # Show user's personal tasks and workspace tasks
        query = query.filter(
            (Task.user_id == current_user.id) | 
            (Task.workspace_id.in_(
                db.query(WorkspaceMember.workspace_id).filter(
                    WorkspaceMember.user_id == current_user.id
                )
            ))
        )
    
    # Apply filters
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    
    tasks = query.all()
    return tasks


@router.get("/assigned", response_model=List[TaskResponse])
def get_assigned_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks assigned to current user"""
    tasks = db.query(Task).filter(Task.assigned_to_id == current_user.id).all()
    return tasks


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task"""
    # Prepare task data
    task_dict = task_data.model_dump()
    task_dict["user_id"] = current_user.id
    
    # Verify workspace access if workspace_id provided
    if task_data.workspace_id:
        if not _check_workspace_access(db, current_user.id, task_data.workspace_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No access to this workspace"
            )
    
    new_task = Task(**task_dict)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    # Broadcast to workspace if applicable
    if new_task.workspace_id:
        await sync_task_created(new_task, new_task.workspace_id)
    
    # Notify assigned user if applicable
    if new_task.assigned_to_id:
        await sync_task_assigned(new_task, new_task.assigned_to_id)
    
    return new_task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions - user must own the task or be in the workspace
    has_access = (
        task.user_id == current_user.id or
        (task.workspace_id and _check_workspace_access(db, current_user.id, task.workspace_id))
    )
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permission to update this task"
        )
    
    # Update task fields
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.updated_at = datetime.utcnow()
    task.last_synced_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    
    # Broadcast to workspace if applicable
    if task.workspace_id:
        await sync_task_updated(task, task.workspace_id)
    
    # Notify newly assigned user if assignment changed
    if "assigned_to_id" in update_data and task.assigned_to_id:
        await sync_task_assigned(task, task.assigned_to_id)
    
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    has_access = (
        task.user_id == current_user.id or
        (task.workspace_id and _check_workspace_access(db, current_user.id, task.workspace_id))
    )
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permission to delete this task"
        )
    
    workspace_id = task.workspace_id
    
    db.delete(task)
    db.commit()
    
    # Broadcast deletion to workspace if applicable
    if workspace_id:
        await sync_task_deleted(task_id, workspace_id)
    
    return {"message": "Task deleted successfully"}


@router.get("/export", response_model=TaskExport)
def export_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export user's tasks to JSON"""
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    return TaskExport(tasks=tasks)


@router.post("/import")
def import_tasks(
    task_import: TaskImport,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import tasks from JSON"""
    imported_count = 0
    for task_data in task_import.tasks:
        task_dict = task_data.model_dump()
        task_dict["user_id"] = current_user.id
        
        new_task = Task(**task_dict)
        db.add(new_task)
        imported_count += 1
    
    db.commit()
    
    return {"message": f"Successfully imported {imported_count} tasks"}


@router.get("/upcoming", response_model=List[TaskResponse])
def get_upcoming_reminders(
    hours: int = Query(48, description="Look ahead window in hours"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get upcoming tasks with reminders"""
    from datetime import timedelta
    
    now = datetime.utcnow()
    threshold = now + timedelta(hours=hours)
    
    # Get tasks with deadlines in the next N hours that have reminders set
    query = db.query(Task).filter(
        Task.deadline.between(now, threshold),
        Task.reminder_offset.isnot(None),
        Task.status != 'completed'
    )
    
    # Filter by user access
    query = query.filter(
        (Task.user_id == current_user.id) | 
        (Task.workspace_id.in_(
            db.query(WorkspaceMember.workspace_id).filter(
                WorkspaceMember.user_id == current_user.id
            )
        ))
    )
    
    tasks = query.order_by(Task.deadline.asc()).all()
    return tasks

