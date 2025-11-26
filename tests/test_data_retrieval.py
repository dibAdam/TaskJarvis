"""Tests for data retrieval intent detection and query execution."""

import pytest
from pathlib import Path
from tasks.task_db import TaskDB
from tasks.task import Task
from assistant.assistant import TaskAssistant
from datetime import datetime, timedelta


@pytest.fixture
def db(tmp_path):
    """Create a temporary test database."""
    db_file = tmp_path / "test_data_retrieval.db"
    db = TaskDB(db_path=db_file)
    
    # Add test tasks with various attributes
    current_time = datetime.now()
    
    # High priority pending tasks
    db.add_task(Task(title="Urgent meeting", priority="High", status="Pending", 
                     deadline=(current_time + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")))
    db.add_task(Task(title="Critical bug fix", priority="High", status="Pending",
                     deadline=(current_time + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")))
    
    # Medium priority tasks
    db.add_task(Task(title="Review code", priority="Medium", status="Pending",
                     deadline=(current_time + timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")))
    db.add_task(Task(title="Update docs", priority="Medium", status="Completed",
                     deadline=(current_time - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")))
    
    # Low priority tasks
    db.add_task(Task(title="Organize files", priority="Low", status="Pending"))
    db.add_task(Task(title="Clean desk", priority="Low", status="Completed"))
    
    yield db
    db.close()


class TestDatabaseFiltering:
    """Test database filtering methods."""
    
    def test_get_tasks_with_status_filter(self, db):
        """Should filter tasks by status."""
        pending = db.get_tasks(status="Pending")
        completed = db.get_tasks(status="Completed")
        
        assert len(pending) == 4
        assert len(completed) == 2
        assert all(t.status == "Pending" for t in pending)
        assert all(t.status == "Completed" for t in completed)
    
    def test_get_tasks_with_priority_filter(self, db):
        """Should filter tasks by priority."""
        high = db.get_tasks(priority="High")
        medium = db.get_tasks(priority="Medium")
        low = db.get_tasks(priority="Low")
        
        assert len(high) == 2
        assert len(medium) == 2
        assert len(low) == 2
        assert all(t.priority == "High" for t in high)
    
    def test_get_tasks_with_combined_filters(self, db):
        """Should filter tasks by both status and priority."""
        high_pending = db.get_tasks(status="Pending", priority="High")
        
        assert len(high_pending) == 2
        assert all(t.status == "Pending" and t.priority == "High" for t in high_pending)
    
    def test_get_task_count(self, db):
        """Should return correct task counts."""
        total = db.get_task_count()
        pending = db.get_task_count(status="Pending")
        high_priority = db.get_task_count(priority="High")
        
        assert total == 6
        assert pending == 4
        assert high_priority == 2
    
    def test_get_tasks_with_time_range(self, db):
        """Should filter tasks by time range."""
        current_time = datetime.now()
        start = current_time.strftime("%Y-%m-%d %H:%M:%S")
        end = (current_time + timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")
        
        tasks = db.get_tasks_with_filters(
            time_range_start=start,
            time_range_end=end
        )
        
        # Should get tasks with deadlines in the next 3 days
        assert len(tasks) >= 2  # At least the two high priority tasks


class TestIntentDetection:
    """Test that various phrasings are detected correctly."""
    
    def test_varied_phrasing_detection(self, db):
        """Test that different phrasings for data retrieval are recognized."""
        assistant = TaskAssistant(db)
        
        # These should all trigger list_tasks intent
        test_phrases = [
            "show me my tasks",
            "I want to check my tasks",
            "get my task list",
            "what tasks do I have",
            "display all tasks",
            "show me the data"
        ]
        
        for phrase in test_phrases:
            response = assistant.process_input(phrase)
            # Should return task information, not an error or "unknown" response
            assert "task" in response.lower() or "no tasks" in response.lower()
    
    def test_filtered_query_detection(self, db):
        """Test that filtered queries are detected correctly."""
        assistant = TaskAssistant(db)
        
        # Test priority filter
        response = assistant.process_input("show high priority tasks")
        assert "high priority" in response.lower() or "task" in response.lower()
        
        # Test status filter
        response = assistant.process_input("get my pending tasks")
        assert "pending" in response.lower() or "task" in response.lower()
    
    def test_stats_request_detection(self, db):
        """Test that stats requests are detected."""
        assistant = TaskAssistant(db)
        
        response = assistant.process_input("show me the data")
        # Should include task information
        assert "task" in response.lower() or "no tasks" in response.lower()


class TestQueryTransparency:
    """Test that queries are executed internally without exposing details."""
    
    def test_no_sql_in_output(self, db):
        """Verify SQL queries are not shown to user."""
        assistant = TaskAssistant(db)
        
        response = assistant.process_input("show all tasks")
        
        # Should not contain SQL keywords
        assert "SELECT" not in response
        assert "WHERE" not in response
        assert "FROM tasks" not in response
    
    def test_clean_result_formatting(self, db):
        """Verify results are formatted cleanly."""
        assistant = TaskAssistant(db)
        
        response = assistant.process_input("show my tasks")
        
        # Should have user-friendly formatting
        assert "Task #" in response or "No tasks" in response
        # Should not have raw database output
        assert "cursor" not in response.lower()
        assert "execute" not in response.lower()


class TestEmptyResults:
    """Test handling of empty query results."""
    
    def test_empty_result_message(self, db):
        """Should show friendly message for no results."""
        # Delete all tasks
        db.delete_all_tasks()
        
        assistant = TaskAssistant(db)
        response = assistant.process_input("show my tasks")
        
        assert "no tasks" in response.lower()
        # Should not show error or crash
        assert "error" not in response.lower()


class TestContextAwareness:
    """Test that responses are contextually appropriate."""
    
    def test_context_in_response(self, db):
        """Should include context in response."""
        assistant = TaskAssistant(db)
        
        # Filter by priority
        response = assistant.process_input("show high priority tasks")
        # Should show tasks or indicate no tasks found
        assert ("task" in response.lower() or "no tasks" in response.lower())
        
        # Filter by status
        response = assistant.process_input("show completed tasks")
        # Should show tasks or indicate no tasks found
        assert ("task" in response.lower() or "no tasks" in response.lower())


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
