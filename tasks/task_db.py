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

    def get_tasks(self, status: Optional[str] = None, priority: Optional[str] = None) -> List[Task]:
        cursor = self.conn.cursor()
        
        # Build query dynamically based on filters
        query = "SELECT * FROM tasks WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = ?"
            params.append(status)
            logger.debug(f"Filtering by status: {status}")
        
        if priority:
            query += " AND priority = ?"
            params.append(priority)
            logger.debug(f"Filtering by priority: {priority}")
        
        cursor.execute(query, params)
        logger.debug(f"Fetching tasks with filters - status: {status}, priority: {priority}")
        
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

    def get_tasks_in_range(
        self, 
        start: str, 
        end: str, 
        status: Optional[str] = None
    ) -> List[Task]:
        """
        Get tasks with deadlines within the specified time range.
        
        Args:
            start: Range start in format "YYYY-MM-DD HH:MM:SS"
            end: Range end in format "YYYY-MM-DD HH:MM:SS"
            status: Optional status filter
            
        Returns:
            List of tasks with deadlines in the specified range
            
        Note:
            Tasks without deadlines (deadline IS NULL) are excluded from results.
        """
        cursor = self.conn.cursor()
        
        if status:
            cursor.execute(
                """SELECT * FROM tasks 
                   WHERE deadline IS NOT NULL 
                   AND deadline >= ? 
                   AND deadline <= ? 
                   AND status = ?""",
                (start, end, status)
            )
            logger.debug(f"Fetching tasks in range [{start}, {end}] with status: {status}")
        else:
            cursor.execute(
                """SELECT * FROM tasks 
                   WHERE deadline IS NOT NULL 
                   AND deadline >= ? 
                   AND deadline <= ?""",
                (start, end)
            )
            logger.debug(f"Fetching tasks in range [{start}, {end}]")
        
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
        
        logger.info(f"Retrieved {len(tasks)} tasks in range [{start}, {end}]")
        return tasks

    def delete_tasks_in_range(self, start: str, end: str) -> int:
        """
        Delete all tasks with deadlines within the specified time range.
        
        Args:
            start: Range start in format "YYYY-MM-DD HH:MM:SS"
            end: Range end in format "YYYY-MM-DD HH:MM:SS"
            
        Returns:
            Number of tasks deleted
            
        Note:
            Tasks without deadlines are NOT deleted.
        """
        with self.conn:
            cursor = self.conn.cursor()
            cursor.execute(
                """DELETE FROM tasks 
                   WHERE deadline IS NOT NULL 
                   AND deadline >= ? 
                   AND deadline <= ?""",
                (start, end)
            )
            count = cursor.rowcount
            logger.info(f"Deleted {count} tasks in range [{start}, {end}]")
            return count

    def complete_tasks_in_range(self, start: str, end: str) -> int:
        """
        Mark all tasks with deadlines in the specified range as completed.
        
        Args:
            start: Range start in format "YYYY-MM-DD HH:MM:SS"
            end: Range end in format "YYYY-MM-DD HH:MM:SS"
            
        Returns:
            Number of tasks marked as completed
            
        Note:
            Tasks without deadlines are NOT completed.
        """
        with self.conn:
            cursor = self.conn.cursor()
            cursor.execute(
                """UPDATE tasks 
                   SET status = 'Completed' 
                   WHERE deadline IS NOT NULL 
                   AND deadline >= ? 
                   AND deadline <= ?
                   AND status != 'Completed'""",
                (start, end)
            )
            count = cursor.rowcount
            logger.info(f"Completed {count} tasks in range [{start}, {end}]")
            return count

    def close(self):
        self.conn.close()

    def delete_all_tasks(self) -> int:
        """Delete all tasks. Returns count deleted."""
        with self.conn:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM tasks")
            count = cursor.rowcount
            logger.info(f"Deleted all tasks: {count} tasks removed")
            return count

    def complete_all_tasks(self) -> int:
        """Mark all tasks as completed. Returns count."""
        with self.conn:
            cursor = self.conn.cursor()
            cursor.execute("UPDATE tasks SET status = 'Completed' WHERE status != 'Completed'")
            count = cursor.rowcount
            logger.info(f"Completed all tasks: {count} tasks marked as completed")
            return count

    def get_task_count(self, status: Optional[str] = None, priority: Optional[str] = None) -> int:
        """
        Get count of tasks matching the given filters.
        
        Args:
            status: Optional status filter
            priority: Optional priority filter
            
        Returns:
            Number of tasks matching filters
        """
        cursor = self.conn.cursor()
        query = "SELECT COUNT(*) FROM tasks WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        if priority:
            query += " AND priority = ?"
            params.append(priority)
        
        cursor.execute(query, params)
        count = cursor.fetchone()[0]
        logger.debug(f"Task count with filters (status={status}, priority={priority}): {count}")
        return count

    def get_tasks_with_filters(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        time_range_start: Optional[str] = None,
        time_range_end: Optional[str] = None
    ) -> List[Task]:
        """
        Get tasks with comprehensive filtering options.
        
        Args:
            status: Optional status filter (Pending, Completed)
            priority: Optional priority filter (High, Medium, Low)
            time_range_start: Optional start of time range (YYYY-MM-DD HH:MM:SS)
            time_range_end: Optional end of time range (YYYY-MM-DD HH:MM:SS)
            
        Returns:
            List of tasks matching all specified filters
        """
        cursor = self.conn.cursor()
        query = "SELECT * FROM tasks WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        if priority:
            query += " AND priority = ?"
            params.append(priority)
        
        if time_range_start and time_range_end:
            query += " AND deadline IS NOT NULL AND deadline >= ? AND deadline <= ?"
            params.append(time_range_start)
            params.append(time_range_end)
        
        cursor.execute(query, params)
        logger.debug(f"Fetching tasks with comprehensive filters - status: {status}, priority: {priority}, time_range: {time_range_start} to {time_range_end}")
        
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
        
        logger.info(f"Retrieved {len(tasks)} tasks with comprehensive filters")
        return tasks

