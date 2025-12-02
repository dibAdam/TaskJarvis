from datetime import datetime, timedelta
from sqlalchemy import text
from backend.database import SessionLocal
from taskjarvis_logging.logger import get_logger

logger = get_logger(__name__)

class SmartScheduler:
    """Smart scheduling suggestions for task management."""
    
    def __init__(self):
        pass
    
    def get_overdue_tasks(self) -> list:
        """Get all overdue tasks."""
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            query = text("""
                SELECT id, title, deadline, priority
                FROM tasks
                WHERE deadline < :now
                AND status != 'completed'
                ORDER BY deadline ASC
            """)
            result = db.execute(query, {"now": now})
            tasks = result.fetchall()
            return tasks
        except Exception as e:
            logger.error(f"Error getting overdue tasks: {e}")
            return []
        finally:
            db.close()
    
    def get_urgent_tasks(self, hours: int = 24) -> list:
        """Get tasks due within the next N hours."""
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            threshold = now + timedelta(hours=hours)
            query = text("""
                SELECT id, title, deadline, priority
                FROM tasks
                WHERE deadline BETWEEN :now AND :threshold
                AND status != 'completed'
                ORDER BY deadline ASC
            """)
            result = db.execute(query, {"now": now, "threshold": threshold})
            tasks = result.fetchall()
            return tasks
        except Exception as e:
            logger.error(f"Error getting urgent tasks: {e}")
            return []
        finally:
            db.close()
    
    def suggest_reschedule(self, task_id: int, suggested_time: datetime = None) -> dict:
        """Suggest rescheduling an overdue task."""
        if suggested_time is None:
            # Default: suggest tomorrow morning at 9 AM
            suggested_time = datetime.utcnow().replace(hour=9, minute=0, second=0, microsecond=0) + timedelta(days=1)
        
        return {
            "task_id": task_id,
            "suggested_deadline": suggested_time,
            "reason": "This task is overdue. Would you like to reschedule it?"
        }
    
    def get_scheduling_summary(self) -> str:
        """Get a summary of scheduling status and suggestions."""
        overdue = self.get_overdue_tasks()
        urgent = self.get_urgent_tasks(24)
        
        summary = []
        
        if overdue:
            summary.append(f"⚠️ You have {len(overdue)} overdue task(s):")
            for task in overdue[:3]:  # Show top 3
                task_id, title, deadline, priority = task
                summary.append(f"  - [{task_id}] {title} (was due: {deadline})")
            if len(overdue) > 3:
                summary.append(f"  ... and {len(overdue) - 3} more")
            summary.append("")
        
        if urgent:
            summary.append(f"🔔 {len(urgent)} task(s) due in the next 24 hours:")
            for task in urgent[:3]:  # Show top 3
                task_id, title, deadline, priority = task
                summary.append(f"  - [{task_id}] {title} (due: {deadline})")
            if len(urgent) > 3:
                summary.append(f"  ... and {len(urgent) - 3} more")
        
        if not overdue and not urgent:
            summary.append("✅ No overdue or urgent tasks. You're all caught up!")
        
        return "\n".join(summary)
