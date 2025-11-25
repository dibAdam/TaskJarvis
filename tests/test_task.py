import pytest
import os
from tasks.task import Task
from tasks.task_db import TaskDB

# Use in-memory DB for testing
TEST_DB = ":memory:"

@pytest.fixture
def db():
    db = TaskDB(db_path=TEST_DB)
    yield db
    db.close()

def test_task_model():
    t = Task(title="Test Task", priority="High")
    assert t.title == "Test Task"
    assert t.priority == "High"
    assert t.status == "Pending"

def test_add_task(db):
    t = Task(title="Buy Milk")
    task_id = db.add_task(t)
    assert task_id is not None
    
    tasks = db.get_tasks()
    assert len(tasks) == 1
    assert tasks[0].title == "Buy Milk"

def test_update_task(db):
    t = Task(title="Update Me")
    task_id = db.add_task(t)
    
    db.update_task(task_id, status="Completed")
    tasks = db.get_tasks()
    assert tasks[0].status == "Completed"

def test_delete_task(db):
    t = Task(title="Delete Me")
    task_id = db.add_task(t)
    
    db.delete_task(task_id)
    tasks = db.get_tasks()
    assert len(tasks) == 0
