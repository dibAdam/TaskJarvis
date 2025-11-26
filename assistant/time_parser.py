"""Time range parsing utilities for TaskJarvis.

This module handles parsing of time-range expressions from natural language,
including natural periods (today, this week), explicit ranges (from X to Y),
and relative expressions (in 3 days, within 2 hours).
"""

import re
import dateparser
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from taskjarvis_logging.logger import get_logger

logger = get_logger(__name__)

# Scope keywords that should NOT be parsed as time periods
SCOPE_KEYWORDS = {'all', 'everything', 'anything', 'full', 'total', 'entire'}
FILLER_WORDS = {'tasks', 'task', 'my', 'the', 'a', 'an', 'of', 'them'}


def contains_scope_keywords(text: str) -> bool:
    """
    Check if text contains scope keywords indicating bulk operations.
    
    This prevents "all tasks", "everything", etc. from being parsed as time periods.
    
    Args:
        text: Input text to check
        
    Returns:
        True if text contains scope keywords and no time indicators
    """
    text_lower = text.lower()
    words = set(text_lower.split())
    
    # Remove filler words to get meaningful content
    meaningful_words = words - FILLER_WORDS
    
    # Check if any scope keyword is present
    has_scope_keyword = bool(meaningful_words & SCOPE_KEYWORDS)
    
    # Check if there are time-related words
    time_indicators = {'today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 
                       'from', 'to', 'between', 'in', 'past', 'next', 'last', 'this'}
    
    # Check for whole words to avoid partial matches (e.g., "in" inside "everything")
    words_list = text_lower.split()
    has_time_indicator = any(word in time_indicators for word in words_list)
    
    # Return True if scope keyword present but no time indicators
    return has_scope_keyword and not has_time_indicator


@dataclass
class TimeRange:
    """Represents a time range with start and end timestamps."""
    
    start: str  # "YYYY-MM-DD HH:MM:SS"
    end: str    # "YYYY-MM-DD HH:MM:SS"
    
    def to_dict(self) -> Dict[str, str]:
        """Convert to dictionary format for JSON serialization."""
        return {"start": self.start, "end": self.end}
    
    def __str__(self) -> str:
        return f"TimeRange({self.start} to {self.end})"


def parse_time_range(text: str, reference_time: Optional[datetime] = None) -> Optional[TimeRange]:
    """
    Parse a time range from natural language text.
    
    This is the main entry point for time range parsing. It attempts to detect
    and parse various time range formats:
    - Natural periods: "today", "this week", "last month"
    - Relative periods: "in 3 days", "within 2 hours", "past week"
    - Explicit ranges: "from X to Y", "between A and B"
    
    Args:
        text: Natural language text containing a time range expression
        reference_time: Reference time for relative dates (defaults to now)
        
    Returns:
        TimeRange object if parsing successful, None otherwise
    """
    if not text or not text.strip():
        return None
    
    # Check for scope keywords (all, everything, etc.)
    # These indicate bulk operations, not time periods
    if contains_scope_keywords(text):
        logger.info(f"Skipping time parse due to scope keyword in: '{text}'")
        return None
    
    if reference_time is None:
        reference_time = datetime.now()
    
    text = text.lower().strip()
    logger.debug(f"Parsing time range from: '{text}'")
    
    # Try natural periods first (most common)
    time_range = resolve_natural_period(text, reference_time)
    if time_range:
        logger.info(f"Parsed natural period: '{text}' → {time_range}")
        return time_range
    
    # Try explicit ranges (from X to Y, between A and B)
    time_range = resolve_explicit_range(text, reference_time)
    if time_range:
        logger.info(f"Parsed explicit range: '{text}' → {time_range}")
        return time_range
    
    # Try relative periods (in 3 days, within 2 hours)
    time_range = resolve_relative_period(text, reference_time)
    if time_range:
        logger.info(f"Parsed relative period: '{text}' → {time_range}")
        return time_range
    
    logger.warning(f"Could not parse time range from: '{text}'")
    return None


def resolve_natural_period(period: str, reference_time: datetime) -> Optional[TimeRange]:
    """Resolve natural language period names to time ranges."""
    period = period.lower().strip()
    
    # Today, tomorrow, yesterday
    if period == "today":
        start = reference_time.replace(hour=0, minute=0, second=0, microsecond=0)
        end = reference_time.replace(hour=23, minute=59, second=59, microsecond=0)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    if period == "tomorrow":
        tomorrow = reference_time + timedelta(days=1)
        start = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
        end = tomorrow.replace(hour=23, minute=59, second=59, microsecond=0)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    if period == "yesterday":
        yesterday = reference_time - timedelta(days=1)
        start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        end = yesterday.replace(hour=23, minute=59, second=59, microsecond=0)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    # Week periods
    if period in ["this week", "current week"]:
        start, end = _get_week_range(reference_time, 0)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    if period in ["next week", "upcoming week"]:
        start, end = _get_week_range(reference_time, 1)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    if period in ["last week", "previous week"]:
        start, end = _get_week_range(reference_time, -1)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    # Month periods
    if period in ["this month", "current month"]:
        start, end = _get_month_range(reference_time, 0)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    if period == "next month":
        start, end = _get_month_range(reference_time, 1)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    if period in ["last month", "previous month"]:
        start, end = _get_month_range(reference_time, -1)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    # Year periods
    if period in ["this year", "current year"]:
        start = reference_time.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = reference_time.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=0)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    return None


def resolve_relative_period(text: str, reference_time: datetime) -> Optional[TimeRange]:
    """Resolve relative time expressions to time ranges."""
    text = text.lower().strip()
    
    # Pattern: "in the next X days/hours/weeks"
    match = re.search(r'in\s+the\s+next\s+(\d+)\s+(hour|day|week|month)s?', text)
    if match:
        amount = int(match.group(1))
        unit = match.group(2)
        return _create_future_range(reference_time, amount, unit)
    
    # Pattern: "within X hours/days"
    match = re.search(r'within\s+(\d+)\s+(hour|day|week|month)s?', text)
    if match:
        amount = int(match.group(1))
        unit = match.group(2)
        return _create_future_range(reference_time, amount, unit)
    
    # Pattern: "in X days/hours"
    match = re.search(r'in\s+(\d+)\s+(hour|day|week|month)s?', text)
    if match:
        amount = int(match.group(1))
        unit = match.group(2)
        return _create_future_range(reference_time, amount, unit)
    
    # Pattern: "past X hours/days"
    match = re.search(r'past\s+(\d+)\s+(hour|day|week|month)s?', text)
    if match:
        amount = int(match.group(1))
        unit = match.group(2)
        return _create_past_range(reference_time, amount, unit)
    
    # Pattern: "from the past X days" or "from the past week" (optional number)
    match = re.search(r'from\s+the\s+past\s+(\d+)?\s*(hour|day|week|month)s?', text)
    if match:
        amount = int(match.group(1)) if match.group(1) else 1
        unit = match.group(2)
        return _create_past_range(reference_time, amount, unit)
    
    # Pattern: "in the upcoming week/month"
    if "upcoming week" in text or "in the upcoming week" in text:
        start, end = _get_week_range(reference_time, 1)
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    
    return None


def resolve_explicit_range(text: str, reference_time: datetime) -> Optional[TimeRange]:
    """Resolve explicit date range expressions."""
    text = text.lower().strip()
    
    # Pattern: "from X to Y"
    match = re.search(r'from\s+(.+?)\s+to\s+(.+?)(?:\s|$)', text)
    if match:
        start_text = match.group(1).strip()
        end_text = match.group(2).strip()
        return _parse_range_endpoints(start_text, end_text, reference_time)
    
    # Pattern: "between X and Y"
    match = re.search(r'between\s+(.+?)\s+and\s+(.+?)(?:\s|$)', text)
    if match:
        start_text = match.group(1).strip()
        end_text = match.group(2).strip()
        return _parse_range_endpoints(start_text, end_text, reference_time)
    
    return None


# Helper functions

def _get_week_range(reference_time: datetime, week_offset: int) -> Tuple[datetime, datetime]:
    """Get start and end of a week relative to reference time."""
    days_since_monday = reference_time.weekday()
    monday = reference_time - timedelta(days=days_since_monday)
    target_monday = monday + timedelta(weeks=week_offset)
    start = target_monday.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=6, hours=23, minutes=59, seconds=59)
    return start, end


def _get_month_range(reference_time: datetime, month_offset: int) -> Tuple[datetime, datetime]:
    """Get start and end of a month relative to reference time."""
    target_month = reference_time.month + month_offset
    target_year = reference_time.year
    
    while target_month > 12:
        target_month -= 12
        target_year += 1
    while target_month < 1:
        target_month += 12
        target_year -= 1
    
    start = datetime(target_year, target_month, 1, 0, 0, 0)
    
    if target_month == 12:
        next_month = datetime(target_year + 1, 1, 1, 0, 0, 0)
    else:
        next_month = datetime(target_year, target_month + 1, 1, 0, 0, 0)
    
    end = next_month - timedelta(seconds=1)
    return start, end


def _create_future_range(reference_time: datetime, amount: int, unit: str) -> TimeRange:
    """Create a time range from now to a future point."""
    start = reference_time
    
    if unit == "hour":
        end = start + timedelta(hours=amount)
    elif unit == "day":
        end = start + timedelta(days=amount)
    elif unit == "week":
        end = start + timedelta(weeks=amount)
    elif unit == "month":
        end = start + timedelta(days=amount * 30)
    else:
        end = start
    
    return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))


def _create_past_range(reference_time: datetime, amount: int, unit: str) -> TimeRange:
    """Create a time range from a past point to now."""
    end = reference_time
    
    if unit == "hour":
        start = end - timedelta(hours=amount)
    elif unit == "day":
        start = end - timedelta(days=amount)
    elif unit == "week":
        start = end - timedelta(weeks=amount)
    elif unit == "month":
        start = end - timedelta(days=amount * 30)
    else:
        start = end
    
    return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))


def _parse_range_endpoints(start_text: str, end_text: str, reference_time: datetime) -> Optional[TimeRange]:
    """Parse start and end points of an explicit range."""
    try:
        start_parsed = dateparser.parse(start_text, settings={'RELATIVE_BASE': reference_time, 'PREFER_DATES_FROM': 'past', 'RETURN_AS_TIMEZONE_AWARE': False})
        end_parsed = dateparser.parse(end_text, settings={'RELATIVE_BASE': reference_time, 'PREFER_DATES_FROM': 'future', 'RETURN_AS_TIMEZONE_AWARE': False})
        
        if not start_parsed or not end_parsed:
            return None
        
        start = start_parsed.replace(hour=0, minute=0, second=0, microsecond=0)
        end = end_parsed.replace(hour=23, minute=59, second=59, microsecond=0)
        
        if start > end:
            logger.warning(f"Invalid range: start ({start}) is after end ({end})")
            return None
        
        return TimeRange(start=start.strftime("%Y-%m-%d %H:%M:%S"), end=end.strftime("%Y-%m-%d %H:%M:%S"))
    except Exception as e:
        logger.error(f"Error parsing range endpoints: {e}")
        return None
