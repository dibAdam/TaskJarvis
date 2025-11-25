import sqlite3
from typing import List, Optional
from config import settings
from tasks.task import Task
from taskjarvis_logging.logger import get_logger

logger = get_logger(__name__)

class TaskDB:
    def __init__(self, db_path=settings.DB_PATH):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._create_table()
        logger.info(f"TaskDB initialized with database: {self.db_path}")

    def _create_table(self):
        with self.conn:
            cursor = self.conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    priority TEXT,
                    deadline TEXT,
                    status TEXT
                )
            """)

    def add_task(self, task: Task) -> int:
        with self.conn:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO tasks (title, description, priority, deadline, status)
                VALUES (?, ?, ?, ?, ?)
            """, (task.title, task.description, task.priority, task.deadline, task.status))
            task_id = cursor.lastrowid
            logger.info(f"Task added: ID={task_id}, Title='{task.title}', Priority={task.priority}, Deadline={task.deadline}")
            return task_id

    def get_tasks(self, status: Optional[str] = None) -> List[Task]:
        cursor = self.conn.cursor()
        if status:
            cursor.execute("SELECT * FROM tasks WHERE status = ?", (status,))
            logger.debug(f"Fetching tasks with status: {status}")
        else:
            cursor.execute("SELECT * FROM tasks")
            logger.debug("Fetching all tasks")
        
        rows = cursor.fetchall()
        tasks = []
        for row in rows:
            tasks.append(Task(
                id=row[0],
                title=row[1],
                description=row[2],
                priority=row[3],
                deadline=row[4],
                status=row[5]
            ))
        logger.debug(f"Retrieved {len(tasks)} tasks")
        return tasks

    def update_task(self, task_id: int, **kwargs):
        with self.conn:
            cursor = self.conn.cursor()
            set_clause = ", ".join([f"{key} = ?" for key in kwargs.keys()])
            values = list(kwargs.values())
            values.append(task_id)
            
            cursor.execute(f"UPDATE tasks SET {set_clause} WHERE id = ?", values)
            logger.info(f"Task updated: ID={task_id}, Changes={kwargs}")

    def delete_task(self, task_id: int):
        with self.conn:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            logger.info(f"Task deleted: ID={task_id}")

    def close(self):
        self.conn.close()

