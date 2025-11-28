"""Real-time sync event handlers for tasks"""

from backend.websocket.manager import manager
from backend.tasks.models import Task
from datetime import datetime


async def sync_task_created(task: Task, workspace_id: int):
    """Broadcast task creation to workspace members"""
    if workspace_id:
        await manager.broadcast_to_workspace(workspace_id, {
            "type": "task_created",
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "deadline": task.deadline.isoformat() if task.deadline else None,
                "status": task.status,
                "user_id": task.user_id,
                "workspace_id": task.workspace_id,
                "assigned_to_id": task.assigned_to_id,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
        })


async def sync_task_updated(task: Task, workspace_id: int):
    """Broadcast task update to workspace members"""
    if workspace_id:
        await manager.broadcast_to_workspace(workspace_id, {
            "type": "task_updated",
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "deadline": task.deadline.isoformat() if task.deadline else None,
                "status": task.status,
                "user_id": task.user_id,
                "workspace_id": task.workspace_id,
                "assigned_to_id": task.assigned_to_id,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
        })


async def sync_task_deleted(task_id: int, workspace_id: int):
    """Broadcast task deletion to workspace members"""
    if workspace_id:
        await manager.broadcast_to_workspace(workspace_id, {
            "type": "task_deleted",
            "task_id": task_id
        })


async def sync_task_assigned(task: Task, assigned_to_id: int):
    """Send notification to assigned user"""
    if assigned_to_id:
        await manager.send_personal_message(assigned_to_id, {
            "type": "task_assigned",
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "deadline": task.deadline.isoformat() if task.deadline else None,
                "status": task.status,
                "workspace_id": task.workspace_id
            }
        })
