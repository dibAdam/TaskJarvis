from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from api.schemas import TaskResponse, TaskCreate, TaskUpdate
from api.dependencies import get_db
from tasks.task_db import TaskDB
from tasks.task import Task

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = None, 
    priority: Optional[str] = None,
    db: TaskDB = Depends(get_db)
):
    tasks = db.get_tasks(status=status, priority=priority)
    return tasks

@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: TaskDB = Depends(get_db)):
    # Normalize status to lowercase
    status = (task.status or "pending").lower()
    
    new_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        deadline=task.deadline,
        status=status,
        reminder_offset=task.reminder_offset  # Add reminder offset
    )
    task_id = db.add_task(new_task)
    new_task.id = task_id
    return new_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: TaskDB = Depends(get_db)):
    # Check if task exists first (optional but good practice)
    # TaskDB doesn't have get_task_by_id, but update handles it gracefully usually
    # For now, we just call update
    
    update_data = task_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Normalize status to lowercase if provided
    if 'status' in update_data and update_data['status']:
        update_data['status'] = update_data['status'].lower()
        
    db.update_task(task_id, **update_data)
    
    # Fetch updated task - inefficient but TaskDB doesn't return it
    # We have to filter by ID which get_tasks doesn't natively support well without modification
    # But we can't modify TaskDB. 
    # Workaround: Get all tasks and find by ID (inefficient) or trust the update.
    # Let's trust the update and return the constructed object for now, 
    # OR better: since we can't modify backend, we might just return the input + id.
    
    # Actually, let's try to find it to be correct.
    all_tasks = db.get_tasks()
    updated_task = next((t for t in all_tasks if t.id == task_id), None)
    
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    return updated_task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: TaskDB = Depends(get_db)):
    db.delete_task(task_id)
    return {"message": "Task deleted successfully"}
