from datetime import datetime
from dateutil.rrule import rrulestr
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def get_next_occurrence(recurrence_rule: str, base_date: datetime) -> Optional[datetime]:
    """
    Calculate the next occurrence of a task based on the recurrence rule.
    
    Args:
        recurrence_rule: iCalendar RRULE string (e.g., "FREQ=DAILY;INTERVAL=1")
        base_date: The starting date/time (usually the last deadline or completion time)
        
    Returns:
        datetime: The next occurrence, or None if the rule is invalid or has ended.
    """
    try:
        # rrulestr parses the rule string. 
        # dtstart is required for relative rules, usually set to the base date.
        rule = rrulestr(recurrence_rule, dtstart=base_date)
        
        # Get the next occurrence after the base_date
        next_date = rule.after(base_date)
        
        return next_date
    except Exception as e:
        logger.error(f"Error calculating next occurrence for rule '{recurrence_rule}': {e}")
        return None
