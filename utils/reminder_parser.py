import re
from typing import Optional

def extract_reminder_offset(user_input: str) -> Optional[int]:
    """
    Extract reminder offset from user input as a fallback.
    Returns offset in minutes, or None if not found.
    """
    user_input_lower = user_input.lower()
    
    # Pattern 1: "X minute(s) reminder" or "X minute(s) before"
    patterns = [
        r'(\d+)\s*minute(?:s)?\s*(?:reminder|before)',
        r'with\s*(?:a\s*)?(\d+)\s*minute(?:s)?\s*reminder',
        r'remind\s*me\s*(\d+)\s*minute(?:s)?\s*before',
        r'(\d+)\s*hour(?:s)?\s*(?:reminder|before)',
        r'remind\s*me\s*(\d+)\s*hour(?:s)?\s*before',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, user_input_lower)
        if match:
            value = int(match.group(1))
            # Check if it's hours
            if 'hour' in pattern:
                return value * 60  # Convert to minutes
            return value
    
    # Pattern 2: Just "remind me" with no time specified
    if re.search(r'remind\s*me', user_input_lower):
        return 15  # Default 15 minutes
    
    return None
