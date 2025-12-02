from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from sqlalchemy import text
from backend.database import SessionLocal
from services.notification_manager import NotificationManager
from utils.recurrence import get_next_occurrence
import logging

logger = logging.getLogger(__name__)

class ReminderScheduler:
    """Background scheduler for task reminders and recurring tasks."""
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.notification_manager = NotificationManager()
        
    def start(self):
        """Start the scheduler with all jobs."""
        # Check for due reminders every minute
        self.scheduler.add_job(
            self.check_reminders,
            'interval',
            minutes=1,
            id='check_reminders',
            replace_existing=True
        )
        
        # Process recurring tasks every hour
        self.scheduler.add_job(
            self.process_recurring_tasks,
            'interval',
            hours=1,
            id='process_recurring',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("Reminder scheduler started")
        
    def stop(self):
        """Stop the scheduler."""
        self.scheduler.shutdown()
        logger.info("Reminder scheduler stopped")
        
    def check_reminders(self):
        """Check for tasks that need reminders sent."""
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            
            # Find tasks with reminders that haven't been sent yet
            query = text("""
                SELECT id, title, deadline, reminder_offset, last_reminded_at, user_id
                FROM tasks
                WHERE deadline IS NOT NULL
                AND reminder_offset IS NOT NULL
                AND LOWER(status) != 'completed'
                AND (last_reminded_at IS NULL OR last_reminded_at < deadline - INTERVAL '1 minute' * reminder_offset)
            """)
            
            result = db.execute(query)
            tasks = result.fetchall()
            
            for task in tasks:
                task_id, title, deadline, reminder_offset, last_reminded_at, user_id = task
                
                # Calculate when the reminder should be sent
                reminder_time = deadline - timedelta(minutes=reminder_offset)
                
                # If it's time to send the reminder
                if now >= reminder_time:
                    logger.info(f"Sending reminder for task {task_id}: {title}")
                    
                    # Get user info if available
                    user_email = None
                    user_phone = None
                    if user_id:
                        user_query = text("SELECT email FROM users WHERE id = :user_id")
                        user_result = db.execute(user_query, {"user_id": user_id}).fetchone()
                        if user_result:
                            user_email = user_result[0]
                    
                    # Send notification
                    self.notification_manager.send_task_reminder(
                        task_title=title,
                        task_deadline=str(deadline),
                        user_email=user_email,
                        user_phone=user_phone
                    )
                    
                    # Update last_reminded_at
                    update_query = text("""
                        UPDATE tasks 
                        SET last_reminded_at = :now 
                        WHERE id = :task_id
                    """)
                    db.execute(update_query, {"now": now, "task_id": task_id})
                    db.commit()
                    
        except Exception as e:
            logger.error(f"Error checking reminders: {e}")
            db.rollback()
        finally:
            db.close()
            
    def process_recurring_tasks(self):
        """Process recurring tasks and create new instances."""
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            
            # Find completed recurring tasks
            query = text("""
                SELECT id, title, description, priority, deadline, status, 
                       recurrence_rule, reminder_offset, user_id, workspace_id
                FROM tasks
                WHERE recurrence_rule IS NOT NULL
                AND LOWER(status) = 'completed'
                AND deadline < :now
            """)
            
            result = db.execute(query, {"now": now})
            tasks = result.fetchall()
            
            for task in tasks:
                (task_id, title, description, priority, deadline, status,
                 recurrence_rule, reminder_offset, user_id, workspace_id) = task
                
                # Calculate next occurrence
                next_deadline = get_next_occurrence(recurrence_rule, deadline)
                
                if next_deadline:
                    logger.info(f"Creating next occurrence for recurring task {task_id}: {title}")
                    
                    # Create new task instance
                    insert_query = text("""
                        INSERT INTO tasks (title, description, priority, deadline, status, 
                                         recurrence_rule, reminder_offset, user_id, workspace_id,
                                         created_at, updated_at)
                        VALUES (:title, :description, :priority, :deadline, 'Pending',
                                :recurrence_rule, :reminder_offset, :user_id, :workspace_id,
                                NOW(), NOW())
                    """)
                    
                    db.execute(insert_query, {
                        "title": title,
                        "description": description,
                        "priority": priority,
                        "deadline": next_deadline,
                        "recurrence_rule": recurrence_rule,
                        "reminder_offset": reminder_offset,
                        "user_id": user_id,
                        "workspace_id": workspace_id
                    })
                    db.commit()
                    
        except Exception as e:
            logger.error(f"Error processing recurring tasks: {e}")
            db.rollback()
        finally:
            db.close()

# Global scheduler instance
scheduler = None

def get_scheduler() -> ReminderScheduler:
    """Get or create the global scheduler instance."""
    global scheduler
    if scheduler is None:
        scheduler = ReminderScheduler()
    return scheduler
