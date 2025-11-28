from typing import List, Optional, Any
from sqlalchemy import text
from backend.database import SessionLocal
from tasks.task import Task
from taskjarvis_logging.logger import get_logger

logger = get_logger(__name__)

class TaskDB:
    def __init__(self, db_path=None):
        # db_path is ignored, kept for backward compatibility
        self.session = SessionLocal()
        logger.info("TaskDB initialized with PostgreSQL session")

    def execute_query(self, query: str, params: tuple = None) -> Any:
        """Execute a raw SQL query"""
        try:
            if params:
                result = self.session.execute(text(query), params)
            else:
                result = self.session.execute(text(query))
            self.session.commit()
            return result
        except Exception as e:
            self.session.rollback()
            logger.error(f"Query execution failed: {e}")
            raise

    def add_task(self, task: Task) -> int:
        """Add a task using raw SQL (legacy support)"""
        query = """
            INSERT INTO tasks (title, description, priority, deadline, status, created_at, updated_at)
            VALUES (:title, :description, :priority, :deadline, :status, NOW(), NOW())
            RETURNING id
        """
        params = {
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "deadline": task.deadline,
            "status": task.status
        }
        result = self.execute_query(query, params)
        task_id = result.scalar()
        return task_id

    def get_tasks(self, status: Optional[str] = None, priority: Optional[str] = None) -> List[Task]:
        """Get tasks using raw SQL (legacy support)"""
        query = "SELECT id, title, description, priority, deadline, status FROM tasks WHERE 1=1"
        params = {}
        
        if status:
            query += " AND status = :status"
            params["status"] = status
        
        if priority:
            query += " AND priority = :priority"
            params["priority"] = priority
            
        result = self.execute_query(query, params)
        
        tasks = []
        for row in result:
            tasks.append(Task(
                id=row.id,
                title=row.title,
                description=row.description,
                priority=row.priority,
                deadline=str(row.deadline) if row.deadline else None,
                status=row.status
            ))
        return tasks

    def update_task(self, task_id: int, **kwargs):
        """Update a task using raw SQL"""
        set_clauses = []
        params = {"id": task_id}
        
        for key, value in kwargs.items():
            set_clauses.append(f"{key} = :{key}")
            params[key] = value
            
        if not set_clauses:
            return
            
        set_clauses.append("updated_at = NOW()")
            
        query = f"UPDATE tasks SET {', '.join(set_clauses)} WHERE id = :id"
        self.execute_query(query, params)

    def delete_task(self, task_id: int):
        """Delete a task using raw SQL"""
        query = "DELETE FROM tasks WHERE id = :id"
        self.execute_query(query, {"id": task_id})

    def close(self):
        self.session.close()
