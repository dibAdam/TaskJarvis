import os
from pathlib import Path

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database
DB_NAME = "tasks.db"
DB_PATH = BASE_DIR / DB_NAME

# Notifications
NOTIFICATION_TIMEOUT = 10  # seconds

# Task Priorities
PRIORITY_LOW = "Low"
PRIORITY_MEDIUM = "Medium"
PRIORITY_HIGH = "High"

DEFAULT_PRIORITY = PRIORITY_MEDIUM
