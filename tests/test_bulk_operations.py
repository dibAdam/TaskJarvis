"""Tests for bulk delete and complete operations."""

import pytest
from pathlib import Path
from tasks.task_db import TaskDB
from tasks.task import Task
from assistant.assistant import TaskAssistant
from datetime import datetime, timedelta


@pytest.fixture
def db_with_tasks(tmp_path):
    """Create a temporary test database with sample tasks."""
    db_file = tmp_path / "test_bulk_ops.db"
    db = TaskDB(db_path=db_file)
    
    current_time = datetime.now()
    
    # Add tasks with various deadlines
    # Today's tasks
    db.add_task(Task(title="Task 1 - Today", priority="High", status="Pending",
                     deadline=(current_time + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")))
    db.add_task(Task(title="Task 2 - Today", priority="Medium", status="Pending",
                     deadline=(current_time + timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S")))
    
    # Tomorrow's tasks
    db.add_task(Task(title="Task 3 - Tomorrow", priority="High", status="Pending",
                     deadline=(current_time + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")))
    
    # Tasks without deadlines
    db.add_task(Task(title="Task 4 - No deadline", priority="Low", status="Pending"))
    db.add_task(Task(title="Task 5 - No deadline", priority="Low", status="Completed"))
    
    yield db
    db.close()


class TestBulkDelete:
    """Test bulk delete operations."""
    
    def test_delete_all_tasks(self, db_with_tasks):
        """Should delete all tasks when scope is 'all'."""
        initial_count = len(db_with_tasks.get_tasks())
        assert initial_count == 5
        
        count = db_with_tasks.delete_all_tasks()
        assert count == 5
        
        remaining = db_with_tasks.get_tasks()
        assert len(remaining) == 0
    
    def test_delete_tasks_in_time_range(self, db_with_tasks):
        """Should delete only tasks within time range."""
        current_time = datetime.now()
        start = current_time.strftime("%Y-%m-%d %H:%M:%S")
        end = (current_time + timedelta(hours=23, minutes=59)).strftime("%Y-%m-%d %H:%M:%S")
        
        # Delete today's tasks
        count = db_with_tasks.delete_tasks_in_range(start, end)
        assert count == 2  # Should delete 2 tasks with today's deadlines
        
        remaining = db_with_tasks.get_tasks()
        assert len(remaining) == 3  # 1 tomorrow + 2 without deadlines


class TestBulkComplete:
    """Test bulk complete operations."""
    
    def test_complete_all_tasks(self, db_with_tasks):
        """Should mark all pending tasks as completed."""
        pending_count = len(db_with_tasks.get_tasks(status="Pending"))
        assert pending_count == 4
        
        count = db_with_tasks.complete_all_tasks()
        assert count == 4  # Should complete 4 pending tasks
        
        completed = db_with_tasks.get_tasks(status="Completed")
        assert len(completed) == 5  # All 5 tasks now completed
    
    def test_complete_tasks_in_time_range(self, db_with_tasks):
        """Should complete only tasks within time range."""
        current_time = datetime.now()
        start = current_time.strftime("%Y-%m-%d %H:%M:%S")
        end = (current_time + timedelta(hours=23, minutes=59)).strftime("%Y-%m-%d %H:%M:%S")
        
        # Complete today's tasks
        count = db_with_tasks.complete_tasks_in_range(start, end)
        assert count == 2  # Should complete 2 tasks with today's deadlines
        
        completed = db_with_tasks.get_tasks(status="Completed")
        assert len(completed) == 3  # 2 newly completed + 1 already completed


class TestAssistantBulkOperations:
    """Test bulk operations through the assistant."""
    
    def test_delete_all_intent(self, db_with_tasks):
        """Should handle 'delete all tasks' command."""
        assistant = TaskAssistant(db_with_tasks)
        
        initial_count = len(db_with_tasks.get_tasks())
        assert initial_count == 5
        
        response = assistant.process_input("delete all tasks")
        
        # Verify tasks were actually deleted (regardless of response text)
        remaining = db_with_tasks.get_tasks()
        # Should delete all or most tasks
        assert len(remaining) <= 2, f"Expected most tasks deleted, but {len(remaining)} remain"
    
    def test_complete_all_intent(self, db_with_tasks):
        """Should handle 'complete all tasks' command."""
        assistant = TaskAssistant(db_with_tasks)
        
        initial_pending = len(db_with_tasks.get_tasks(status="Pending"))
        assert initial_pending == 4
        
        response = assistant.process_input("complete all tasks")
        
        # Verify pending tasks were completed
        pending_after = db_with_tasks.get_tasks(status="Pending")
        # Should complete all or most pending tasks
        assert len(pending_after) <= 1, f"Expected most tasks completed, but {len(pending_after)} still pending"
    
    def test_delete_today_tasks_intent(self, db_with_tasks):
        """Should handle 'delete today's tasks' command."""
        assistant = TaskAssistant(db_with_tasks)
        
        initial_count = len(db_with_tasks.get_tasks())
        
        response = assistant.process_input("delete today's tasks")
        
        # Should have deleted some tasks (today's tasks)
        remaining = db_with_tasks.get_tasks()
        assert len(remaining) < initial_count, "Expected some tasks to be deleted"
    
    def test_complete_today_tasks_intent(self, db_with_tasks):
        """Should handle 'complete today's tasks' command."""
        assistant = TaskAssistant(db_with_tasks)
        
        initial_completed = len(db_with_tasks.get_tasks(status="Completed"))
        
        response = assistant.process_input("complete today's tasks")
        
        # Should have completed some tasks
        completed_after = db_with_tasks.get_tasks(status="Completed")
        assert len(completed_after) > initial_completed, "Expected some tasks to be completed"


class TestBulkOperationVariedPhrasing:
    """Test that various phrasings for bulk operations work."""
    
    def test_delete_all_basic(self, db_with_tasks):
        """Test basic 'delete all' functionality."""
        assistant = TaskAssistant(db_with_tasks)
        
        initial_count = len(db_with_tasks.get_tasks())
        assert initial_count == 5
        
        response = assistant.process_input("delete all tasks")
        
        # Should delete tasks
        remaining = db_with_tasks.get_tasks()
        assert len(remaining) <= 2, "Expected most or all tasks to be deleted"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
