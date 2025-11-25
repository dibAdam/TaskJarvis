from datetime import datetime

def get_current_timestamp():
    """Returns current timestamp as string."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def format_task_output(task):
    """Formats a task for display."""
    return f"Task #{task.id}: {task.title}\n  Priority: {task.priority}\n  Status: {task.status}\n  Deadline: {task.deadline}"
