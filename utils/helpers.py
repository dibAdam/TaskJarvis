from datetime import datetime
from typing import List

def get_current_timestamp():
    """Returns current timestamp as string."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def format_task_output(task):
    """Formats a task for display."""
    return f"Task #{task.id}: {task.title}\n  Priority: {task.priority}\n  Status: {task.status}\n  Deadline: {task.deadline}"

def format_task_list_with_summary(tasks: List, context: str = "") -> str:
    """
    Format a list of tasks with a summary header.
    
    Args:
        tasks: List of Task objects
        context: Optional context string (e.g., "high priority", "for today")
    
    Returns:
        Formatted string with summary and task list
    """
    if not tasks:
        return format_empty_result(context)
    
    # Build summary
    count = len(tasks)
    task_word = "task" if count == 1 else "tasks"
    
    if context:
        summary = f"You have {count} {task_word} {context}:"
    else:
        summary = f"You have {count} {task_word}:"
    
    # Format tasks
    output = [summary, ""]
    for task in tasks:
        output.append("-" * 40)
        output.append(format_task_output(task))
    
    return "\n".join(output)

def format_empty_result(context: str = "") -> str:
    """
    Format a user-friendly message for empty query results.
    
    Args:
        context: Optional context string describing the query
    
    Returns:
        Friendly message indicating no results
    """
    if context:
        return f"No tasks found {context}."
    return "No tasks found."

def format_stats_inline(tasks: List) -> str:
    """
    Format inline statistics for a task list.
    
    Args:
        tasks: List of Task objects
    
    Returns:
        Formatted statistics string
    """
    if not tasks:
        return "No tasks to analyze."
    
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "Completed")
    pending = total - completed
    
    # Count by priority
    high_priority = sum(1 for t in tasks if t.priority == "High" and t.status != "Completed")
    
    stats_parts = [
        f"Total: {total}",
        f"Completed: {completed}",
        f"Pending: {pending}"
    ]
    
    if high_priority > 0:
        stats_parts.append(f"High Priority Pending: {high_priority}")
    
    return " | ".join(stats_parts)

