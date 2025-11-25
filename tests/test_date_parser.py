"""Test date parsing functionality."""

import pytest
from datetime import datetime, timedelta
from utils.date_parser import parse_deadline, get_current_time_str

def test_parse_relative_deadline():
    """Test parsing relative deadlines like 'in 2 hours'."""
    now = datetime(2025, 11, 25, 20, 0, 0)
    
    # Test "in 2 hours"
    result = parse_deadline("in 2 hours", reference_time=now)
    assert result is not None
    assert "22:00:00" in result  # Should be 2 hours later
    
    # Test "tomorrow"
    result = parse_deadline("tomorrow", reference_time=now)
    assert result is not None
    assert "2025-11-26" in result

def test_parse_absolute_deadline():
    """Test parsing absolute dates."""
    result = parse_deadline("2025-12-25 15:00:00")
    assert result == "2025-12-25 15:00:00"

def test_parse_invalid_deadline():
    """Test that invalid deadlines return None."""
    result = parse_deadline("not a date")
    assert result is None
    
    result = parse_deadline("")
    assert result is None
    
    result = parse_deadline(None)
    assert result is None

def test_get_current_time_str():
    """Test that current time string is formatted correctly."""
    result = get_current_time_str()
    assert len(result) > 0
    assert "(" in result  # Should include day of week
    assert ")" in result
