"""Comprehensive tests for time-range based task queries."""

import pytest
from datetime import datetime, timedelta
from assistant.time_parser import (
    parse_time_range,
    resolve_natural_period,
    resolve_relative_period,
    resolve_explicit_range,
    TimeRange
)
from tasks.task_db import TaskDB
from tasks.task import Task


# ============================================================================
# Time Parser Tests
# ============================================================================

class TestTimeParser:
    """Test time range parsing functionality."""
    
    def test_parse_today(self):
        """Test parsing 'today' period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("today", ref_time)
        
        assert result is not None
        assert result.start == "2025-11-26 00:00:00"
        assert result.end == "2025-11-26 23:59:59"
    
    def test_parse_tomorrow(self):
        """Test parsing 'tomorrow' period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("tomorrow", ref_time)
        
        assert result is not None
        assert result.start == "2025-11-27 00:00:00"
        assert result.end == "2025-11-27 23:59:59"
    
    def test_parse_yesterday(self):
        """Test parsing 'yesterday' period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("yesterday", ref_time)
        
        assert result is not None
        assert result.start == "2025-11-25 00:00:00"
        assert result.end == "2025-11-25 23:59:59"
    
    def test_parse_this_week(self):
        """Test parsing 'this week' period."""
        # Tuesday, Nov 26, 2025
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("this week", ref_time)
        
        assert result is not None
        # Week should start on Monday (Nov 24) and end on Sunday (Nov 30)
        assert result.start == "2025-11-24 00:00:00"
        assert result.end == "2025-11-30 23:59:59"
    
    def test_parse_last_week(self):
        """Test parsing 'last week' period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("last week", ref_time)
        
        assert result is not None
        # Last week: Monday Nov 17 to Sunday Nov 23
        assert result.start == "2025-11-17 00:00:00"
        assert result.end == "2025-11-23 23:59:59"
    
    def test_parse_next_week(self):
        """Test parsing 'next week' period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("next week", ref_time)
        
        assert result is not None
        # Next week: Monday Dec 1 to Sunday Dec 7
        assert result.start == "2025-12-01 00:00:00"
        assert result.end == "2025-12-07 23:59:59"
    
    def test_parse_this_month(self):
        """Test parsing 'this month' period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("this month", ref_time)
        
        assert result is not None
        assert result.start == "2025-11-01 00:00:00"
        assert result.end == "2025-11-30 23:59:59"
    
    def test_parse_last_month(self):
        """Test parsing 'last month' period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("last month", ref_time)
        
        assert result is not None
        assert result.start == "2025-10-01 00:00:00"
        assert result.end == "2025-10-31 23:59:59"
    
    def test_parse_next_month(self):
        """Test parsing 'next month' period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("next month", ref_time)
        
        assert result is not None
        assert result.start == "2025-12-01 00:00:00"
        assert result.end == "2025-12-31 23:59:59"
    
    def test_parse_this_year(self):
        """Test parsing 'this year' period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("this year", ref_time)
        
        assert result is not None
        assert result.start == "2025-01-01 00:00:00"
        assert result.end == "2025-12-31 23:59:59"
    
    def test_parse_in_next_3_days(self):
        """Test parsing 'in the next 3 days' relative period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("in the next 3 days", ref_time)
        
        assert result is not None
        assert result.start == "2025-11-26 12:46:49"
        assert result.end == "2025-11-29 12:46:49"
    
    def test_parse_within_2_hours(self):
        """Test parsing 'within 2 hours' relative period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("within 2 hours", ref_time)
        
        assert result is not None
        assert result.start == "2025-11-26 12:46:49"
        assert result.end == "2025-11-26 14:46:49"
    
    def test_parse_past_24_hours(self):
        """Test parsing 'past 24 hours' relative period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("past 24 hours", ref_time)
        
        assert result is not None
        # Should be 24 hours ago to now
        assert result.start == "2025-11-25 12:46:49"
        assert result.end == "2025-11-26 12:46:49"
    
    def test_parse_from_past_week(self):
        """Test parsing 'from the past week' relative period."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("from the past week", ref_time)
        
        assert result is not None
        # Should be 1 week ago to now
        assert result.start == "2025-11-19 12:46:49"
        assert result.end == "2025-11-26 12:46:49"
    
    def test_parse_explicit_range_from_to(self):
        """Test parsing 'from X to Y' explicit range."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("from 2024-04-01 to 2024-04-05", ref_time)
        
        assert result is not None
        assert result.start == "2024-04-01 00:00:00"
        assert result.end == "2024-04-05 23:59:59"
    
    def test_parse_explicit_range_between_and(self):
        """Test parsing 'between X and Y' explicit range."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        result = parse_time_range("between Monday and Friday", ref_time)
        
        assert result is not None
        # Should parse to the upcoming/current week's Monday-Friday
        # This is a bit fuzzy, but should work
        assert result.start is not None
        assert result.end is not None
    
    def test_parse_invalid_range(self):
        """Test that invalid ranges return None."""
        ref_time = datetime(2025, 11, 26, 12, 46, 49)
        
        result = parse_time_range("not a valid period", ref_time)
        assert result is None
        
        result = parse_time_range("", ref_time)
        assert result is None
        
        result = parse_time_range(None, ref_time)
        assert result is None
    
    def test_timerange_to_dict(self):
        """Test TimeRange to_dict method."""
        tr = TimeRange(start="2025-11-26 00:00:00", end="2025-11-26 23:59:59")
        result = tr.to_dict()
        
        assert result == {
            "start": "2025-11-26 00:00:00",
            "end": "2025-11-26 23:59:59"
        }


# ============================================================================
# Database Range Query Tests
# ============================================================================

class TestTaskDBRangeQueries:
    """Test database range query methods."""
    
    @pytest.fixture
    def db(self):
        """Create a test database."""
        db = TaskDB(db_path=":memory:")
        yield db
        db.close()
    
    @pytest.fixture
    def sample_tasks(self, db):
        """Create sample tasks with various deadlines."""
        tasks = [
            Task(title="Task 1", deadline="2025-11-26 10:00:00", status="Pending"),
            Task(title="Task 2", deadline="2025-11-26 14:00:00", status="Pending"),
            Task(title="Task 3", deadline="2025-11-27 10:00:00", status="Pending"),
            Task(title="Task 4", deadline="2025-11-25 10:00:00", status="Completed"),
            Task(title="Task 5", deadline="2025-11-20 10:00:00", status="Pending"),
            Task(title="Task 6", deadline=None, status="Pending"),  # No deadline
        ]
        
        task_ids = []
        for task in tasks:
            task_id = db.add_task(task)
            task_ids.append(task_id)
        
        return task_ids
    
    def test_get_tasks_in_range(self, db, sample_tasks):
        """Test getting tasks within a time range."""
        # Get tasks for Nov 26
        tasks = db.get_tasks_in_range(
            "2025-11-26 00:00:00",
            "2025-11-26 23:59:59"
        )
        
        assert len(tasks) == 2
        assert all(task.deadline.startswith("2025-11-26") for task in tasks)
    
    def test_get_tasks_in_range_with_status(self, db, sample_tasks):
        """Test getting tasks in range filtered by status."""
        # Get completed tasks from Nov 25
        tasks = db.get_tasks_in_range(
            "2025-11-25 00:00:00",
            "2025-11-25 23:59:59",
            status="Completed"
        )
        
        assert len(tasks) == 1
        assert tasks[0].status == "Completed"
    
    def test_get_tasks_in_range_excludes_null_deadlines(self, db, sample_tasks):
        """Test that tasks without deadlines are excluded."""
        # Get all tasks in a very wide range
        tasks = db.get_tasks_in_range(
            "2025-01-01 00:00:00",
            "2025-12-31 23:59:59"
        )
        
        # Should get 5 tasks (excluding the one with no deadline)
        assert len(tasks) == 5
        assert all(task.deadline is not None for task in tasks)
    
    def test_delete_tasks_in_range(self, db, sample_tasks):
        """Test deleting tasks within a time range."""
        # Delete tasks from Nov 26
        count = db.delete_tasks_in_range(
            "2025-11-26 00:00:00",
            "2025-11-26 23:59:59"
        )
        
        assert count == 2
        
        # Verify they're deleted
        remaining = db.get_tasks()
        assert len(remaining) == 4
    
    def test_delete_tasks_in_range_preserves_null_deadlines(self, db, sample_tasks):
        """Test that deleting by range doesn't affect tasks without deadlines."""
        # Delete all tasks in a very wide range
        count = db.delete_tasks_in_range(
            "2025-01-01 00:00:00",
            "2025-12-31 23:59:59"
        )
        
        assert count == 5
        
        # Task with no deadline should still exist
        remaining = db.get_tasks()
        assert len(remaining) == 1
        assert remaining[0].deadline is None
    
    def test_complete_tasks_in_range(self, db, sample_tasks):
        """Test completing tasks within a time range."""
        # Complete tasks from Nov 26
        count = db.complete_tasks_in_range(
            "2025-11-26 00:00:00",
            "2025-11-26 23:59:59"
        )
        
        assert count == 2
        
        # Verify they're completed
        completed = db.get_tasks(status="Completed")
        # Should have 3 completed (1 original + 2 newly completed)
        assert len(completed) == 3
    
    def test_complete_tasks_in_range_skips_already_completed(self, db, sample_tasks):
        """Test that completing by range doesn't double-count already completed tasks."""
        # Complete tasks from Nov 25 (which has 1 already completed task)
        count = db.complete_tasks_in_range(
            "2025-11-25 00:00:00",
            "2025-11-25 23:59:59"
        )
        
        # Should return 0 because the task is already completed
        assert count == 0
    
    def test_boundary_conditions(self, db, sample_tasks):
        """Test tasks exactly at range boundaries."""
        # Get tasks at exact time
        tasks = db.get_tasks_in_range(
            "2025-11-26 10:00:00",
            "2025-11-26 14:00:00"
        )
        
        # Should include both boundary tasks
        assert len(tasks) == 2


# ============================================================================
# Integration Tests
# ============================================================================

class TestTimeRangeIntegration:
    """Integration tests for time-range functionality."""
    
    @pytest.fixture
    def db(self):
        """Create a test database."""
        db = TaskDB(db_path=":memory:")
        yield db
        db.close()
    
    def test_list_tasks_for_today(self, db):
        """Test listing tasks for today."""
        # Add tasks for today and tomorrow
        today = datetime.now()
        tomorrow = today + timedelta(days=1)
        
        db.add_task(Task(
            title="Today's task",
            deadline=today.strftime("%Y-%m-%d %H:%M:%S")
        ))
        db.add_task(Task(
            title="Tomorrow's task",
            deadline=tomorrow.strftime("%Y-%m-%d %H:%M:%S")
        ))
        
        # Get tasks for today
        today_start = today.replace(hour=0, minute=0, second=0)
        today_end = today.replace(hour=23, minute=59, second=59)
        
        tasks = db.get_tasks_in_range(
            today_start.strftime("%Y-%m-%d %H:%M:%S"),
            today_end.strftime("%Y-%m-%d %H:%M:%S")
        )
        
        assert len(tasks) == 1
        assert tasks[0].title == "Today's task"
    
    def test_delete_old_tasks(self, db):
        """Test deleting old tasks from last week."""
        # Add tasks from various times
        now = datetime.now()
        last_week = now - timedelta(days=7)
        
        db.add_task(Task(
            title="Old task",
            deadline=last_week.strftime("%Y-%m-%d %H:%M:%S")
        ))
        db.add_task(Task(
            title="Recent task",
            deadline=now.strftime("%Y-%m-%d %H:%M:%S")
        ))
        
        # Delete tasks older than 3 days
        cutoff = now - timedelta(days=3)
        count = db.delete_tasks_in_range(
            "2000-01-01 00:00:00",
            cutoff.strftime("%Y-%m-%d %H:%M:%S")
        )
        
        assert count == 1
        
        remaining = db.get_tasks()
        assert len(remaining) == 1
        assert remaining[0].title == "Recent task"
    
    def test_complete_upcoming_tasks(self, db):
        """Test completing tasks in the next few days."""
        now = datetime.now()
        
        # Add tasks for next 5 days
        for i in range(1, 6):
            future = now + timedelta(days=i)
            db.add_task(Task(
                title=f"Task {i}",
                deadline=future.strftime("%Y-%m-%d %H:%M:%S")
            ))
        
        # Complete tasks in next 3 days
        end = now + timedelta(days=3)
        count = db.complete_tasks_in_range(
            now.strftime("%Y-%m-%d %H:%M:%S"),
            end.strftime("%Y-%m-%d %H:%M:%S")
        )
        
        assert count == 3
        
        completed = db.get_tasks(status="Completed")
        assert len(completed) == 3
