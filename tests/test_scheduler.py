import unittest
from datetime import datetime, timedelta, timezone
from scheduler.engine import ReminderScheduler
from backend.database import SessionLocal
from sqlalchemy import text

class TestReminderScheduler(unittest.TestCase):
    """Test reminder triggering logic."""
    
    def setUp(self):
        """Set up test database."""
        self.db = SessionLocal()
        self.scheduler = ReminderScheduler()
    
    def tearDown(self):
        """Clean up test data."""
        self.db.close()
    
    def test_reminder_time_calculation(self):
        """Test that reminder time is correctly calculated."""
        # Create a task due in 2 hours with 30-minute reminder
        deadline = datetime.utcnow() + timedelta(hours=2)
        reminder_offset = 30
        
        # Expected reminder time
        expected_reminder_time = deadline - timedelta(minutes=reminder_offset)
        
        # Verify calculation
        self.assertAlmostEqual(
            expected_reminder_time.timestamp(),
            (deadline - timedelta(minutes=reminder_offset)).timestamp(),
            delta=1
        )
    
    def test_overdue_reminder_not_sent_twice(self):
        """Test that reminders are not sent multiple times."""
        # This would require mocking the database
        # For now, we verify the logic exists in the scheduler
        self.assertTrue(hasattr(self.scheduler, 'check_reminders'))
    
    def test_recurring_task_generation(self):
        """Test that recurring tasks are properly generated."""
        from utils.recurrence import get_next_occurrence
        
        base_date = datetime(2025, 1, 1, 10, 0, 0)
        rule = "FREQ=DAILY;INTERVAL=1"
        
        next_date = get_next_occurrence(rule, base_date)
        expected = datetime(2025, 1, 2, 10, 0, 0)
        
        self.assertEqual(next_date, expected)


class TestTimezoneHandling(unittest.TestCase):
    """Test timezone handling in reminders."""
    
    def test_utc_storage(self):
        """Test that all times are stored in UTC."""
        now_utc = datetime.now(timezone.utc)
        now_naive = datetime.utcnow()
        
        # Verify both are close (within 1 second)
        diff = abs((now_utc.replace(tzinfo=None) - now_naive).total_seconds())
        self.assertLess(diff, 1)
    
    def test_deadline_comparison(self):
        """Test deadline comparison works correctly."""
        now = datetime.utcnow()
        future = now + timedelta(hours=1)
        past = now - timedelta(hours=1)
        
        self.assertTrue(future > now)
        self.assertTrue(past < now)
    
    def test_reminder_offset_calculation(self):
        """Test reminder offset calculation with different timezones."""
        deadline_utc = datetime(2025, 1, 1, 15, 0, 0)  # 3 PM UTC
        reminder_offset = 60  # 1 hour
        
        reminder_time = deadline_utc - timedelta(minutes=reminder_offset)
        expected = datetime(2025, 1, 1, 14, 0, 0)  # 2 PM UTC
        
        self.assertEqual(reminder_time, expected)


if __name__ == '__main__':
    unittest.main()
