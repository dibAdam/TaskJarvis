from functools import lru_cache
from tasks.task_db import TaskDB
from assistant.assistant import TaskAssistant

# Global instances
_db_instance = None
_assistant_instance = None

def get_db() -> TaskDB:
    global _db_instance
    if _db_instance is None:
        _db_instance = TaskDB()
    return _db_instance

def get_assistant() -> TaskAssistant:
    global _assistant_instance
    if _assistant_instance is None:
        db = get_db()
        # Default to settings, can be reconfigured via API
        _assistant_instance = TaskAssistant(db)
    return _assistant_instance

def reset_assistant(provider: str, model_name: str = None):
    global _assistant_instance
    db = get_db()
    _assistant_instance = TaskAssistant(db, provider=provider, model_name=model_name)
    return _assistant_instance
