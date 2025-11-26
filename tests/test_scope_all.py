"""Tests for scope functionality (all tasks operations)."""

import pytest
from datetime import datetime
from assistant.time_parser import contains_scope_keywords, parse_time_range
from tasks.task_db import TaskDB
from tasks.task import Task


class TestScopeKeywordDetection:
    """Test scope keyword detection in time parser."""
    
    def test_detects_all_keyword(self):
        """Should detect 'all' as scope keyword."""
        assert contains_scope_keywords("all tasks") == True
        assert contains_scope_keywords("delete all tasks") == True
        assert contains_scope_keywords("all my tasks") == True
    
    def test_detects_everything_keyword(self):
        """Should detect 'everything' as scope keyword."""
        assert contains_scope_keywords("everything") == True
        assert contains_scope_keywords("delete everything") == True
        assert contains_scope_keywords("complete everything") == True
    
    def test_detects_other_scope_keywords(self):
        """Should detect other scope keywords."""
        assert contains_scope_keywords("total tasks") == True
        assert contains_scope_keywords("entire list") == True
    
    def test_ignores_time_indicators(self):
        """Should not treat as scope if time indicators present."""
        assert contains_scope_keywords("all tasks from today") == False
        assert contains_scope_keywords("all tasks this week") == False
        assert contains_scope_keywords("everything from last month") == False
    
    def test_ignores_non_scope_text(self):
        """Should not detect scope in normal text."""
        assert contains_scope_keywords("show tasks") == False
        assert contains_scope_keywords("delete task 5") == False
        assert contains_scope_keywords("today") == False


class TestTimeParserSkipsScope:
    """Test that time parser skips scope keywords."""
    
    def test_parse_time_range_returns_none_for_all(self):
        """Should return None for 'all tasks'."""
        result = parse_time_range("all tasks")
        assert result is None
    
    def test_parse_time_range_returns_none_for_everything(self):
        """Should return None for 'everything'."""
        result = parse_time_range("everything")
        assert result is None
    
    def test_parse_time_range_works_for_real_periods(self):
        """Should still parse real time periods."""
        result = parse_time_range("today")
        assert result is not None
        assert result.start is not None
        assert result.end is not None


class TestDatabaseScopeMethods:
    """Test database methods for scope operations."""
    
    @pytest.fixture
    def db(self, tmp_path):
        """Create a temporary database for testing."""
        db_file = tmp_path / "test_scope.db"
        db = TaskDB(str(db_file))
        yield db
        db.close()
    
    def test_delete_all_tasks(self, db):
        """Should delete all tasks."""
        # Add some tasks
        db.add_task(Task(title="Task 1", status="Pending"))
        db.add_task(Task(title="Task 2", status="Completed"))
        db.add_task(Task(title="Task 3", status="Pending"))
        
        # Delete all
        count = db.delete_all_tasks()
        assert count == 3
        
        # Verify all deleted
        tasks = db.get_tasks()
        assert len(tasks) == 0
    
    def test_complete_all_tasks(self, db):
        """Should mark all tasks as completed."""
        # Add some tasks
        db.add_task(Task(title="Task 1", status="Pending"))
        db.add_task(Task(title="Task 2", status="Pending"))
        db.add_task(Task(title="Task 3", status="Completed"))
        
        # Complete all
        count = db.complete_all_tasks()
        assert count == 2  # Only 2 were pending
        
        # Verify all completed
        tasks = db.get_tasks()
        assert all(t.status == "Completed" for t in tasks)
    
    def test_delete_all_on_empty_database(self, db):
        """Should handle deleting from empty database."""
        count = db.delete_all_tasks()
        assert count == 0
    
    def test_complete_all_on_empty_database(self, db):
        """Should handle completing in empty database."""
        count = db.complete_all_tasks()
        assert count == 0


class TestIntegrationScopeHandling:
    """Integration tests for scope handling in assistant."""
    
    @pytest.fixture
    def db(self, tmp_path):
        """Create a temporary database for testing."""
        db_file = tmp_path / "test_integration_scope.db"
        db = TaskDB(str(db_file))
        yield db
        db.close()
    
    def test_scope_keywords_not_parsed_as_time(self, db):
        """Scope keywords should not be parsed as time ranges."""
        # This is a critical test - "all" should NOT be treated as a time period
        time_range = parse_time_range("all tasks")
        assert time_range is None
        
        time_range = parse_time_range("everything")
        assert time_range is None
    
    def test_real_time_periods_still_work(self, db):
        """Real time periods should still be parsed correctly."""
        time_range = parse_time_range("today")
        assert time_range is not None
        
        time_range = parse_time_range("this week")
        assert time_range is not None
        
        time_range = parse_time_range("last month")
        assert time_range is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
