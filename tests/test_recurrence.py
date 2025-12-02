import unittest
from datetime import datetime
from utils.recurrence import get_next_occurrence

class TestRecurrence(unittest.TestCase):
    def test_daily_recurrence(self):
        base_date = datetime(2023, 1, 1, 10, 0, 0)
        rule = "FREQ=DAILY;INTERVAL=1"
        next_date = get_next_occurrence(rule, base_date)
        self.assertEqual(next_date, datetime(2023, 1, 2, 10, 0, 0))

    def test_weekly_recurrence(self):
        base_date = datetime(2023, 1, 1, 10, 0, 0) # Sunday
        rule = "FREQ=WEEKLY;INTERVAL=1"
        next_date = get_next_occurrence(rule, base_date)
        self.assertEqual(next_date, datetime(2023, 1, 8, 10, 0, 0))

    def test_invalid_rule(self):
        base_date = datetime(2023, 1, 1, 10, 0, 0)
        rule = "INVALID_RULE"
        next_date = get_next_occurrence(rule, base_date)
        self.assertIsNone(next_date)

    def test_complex_rule(self):
        # Every Monday and Wednesday
        base_date = datetime(2023, 1, 2, 10, 0, 0) # Monday
        rule = "FREQ=WEEKLY;BYDAY=MO,WE"
        next_date = get_next_occurrence(rule, base_date)
        self.assertEqual(next_date, datetime(2023, 1, 4, 10, 0, 0)) # Wednesday

if __name__ == '__main__':
    unittest.main()
