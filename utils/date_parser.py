"""Date parsing utilities for TaskJarvis."""

import dateparser
from datetime import datetime
from typing import Optional
from taskjarvis_logging.logger import get_logger

logger = get_logger(__name__)

def parse_deadline(deadline_str: Optional[str], reference_time: Optional[datetime] = None) -> Optional[str]:
    """
    Parse a deadline string into a standardized format.
    
    Args:
        deadline_str: Natural language deadline (e.g., "tomorrow", "in 2 hours", "2025-12-25")
        reference_time: Reference time for relative dates (defaults to now)
        
    Returns:
        Formatted deadline string (YYYY-MM-DD HH:MM:SS) or None if invalid
    """
    if not deadline_str or deadline_str.strip() == "":
        return None
    
    # Use current time as reference if not provided
    if reference_time is None:
        reference_time = datetime.now()
    
    # Normalize common phrases
    deadline_str = deadline_str.lower().strip()
    deadline_str = deadline_str.replace("one hour from now", "in 1 hour")
    deadline_str = deadline_str.replace("two hours from now", "in 2 hours")
    deadline_str = deadline_str.replace("three hours from now", "in 3 hours")
    deadline_str = deadline_str.replace("30 minutes from now", "in 30 minutes")
    deadline_str = deadline_str.replace("an hour from now", "in 1 hour")
    deadline_str = deadline_str.replace("a day from now", "in 1 day")
    
    logger.debug(f"Parsing deadline: '{deadline_str}' with reference time: {reference_time}")
    
    try:
        # Try to parse with dateparser
        parsed_date = dateparser.parse(
            deadline_str,
            settings={
                'RELATIVE_BASE': reference_time,
                'PREFER_DATES_FROM': 'future',
                'RETURN_AS_TIMEZONE_AWARE': False
            }
        )
        
        if parsed_date:
            formatted = parsed_date.strftime("%Y-%m-%d %H:%M:%S")
            logger.info(f"Deadline parsed: '{deadline_str}' → {formatted}")
            return formatted
        else:
            logger.warning(f"Could not parse deadline: '{deadline_str}'")
            return None
            
    except Exception as e:
        logger.error(f"Error parsing deadline '{deadline_str}': {e}")
        return None

def get_current_time_str() -> str:
    """
    Get current time as a formatted string for LLM context.
    
    Returns:
        Current time in format: "YYYY-MM-DD HH:MM:SS (Day of Week)"
    """
    now = datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S (%A)")
