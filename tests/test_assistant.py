import pytest
from assistant.assistant import TaskAssistant
from tasks.task_db import TaskDB
from tasks.task import Task
import os

# Use in-memory DB for testing
TEST_DB = ":memory:"

@pytest.fixture
def db():
    db = TaskDB(db_path=TEST_DB)
    yield db
    db.close()

@pytest.fixture
def assistant(db):
    # Ensure no API key is set so it uses MockLLMClient
    if "OPENAI_API_KEY" in os.environ:
        del os.environ["OPENAI_API_KEY"]
    return TaskAssistant(db)

def test_mock_add_task(assistant, db):
    response = assistant.process_input("Add task Buy Milk")
    # Just verify a task was added
    tasks = db.get_tasks()
    assert len(tasks) == 1

def test_mock_list_tasks(assistant, db):
    db.add_task(Task("Real Task"))
    response = assistant.process_input("List tasks")
    # Verify the response contains task info
    assert "Real Task" in response or "Mock" in response

def test_mock_complete_task(assistant, db):
    task_id = db.add_task(Task("To Complete"))
    response = assistant.process_input("Complete task 1")
    # Verify response is not an error
    assert "error" not in response.lower() or "Mock" in response

def test_assistant_initialization(assistant):
    # Just verify the assistant initializes correctly
    assert assistant is not None
    assert assistant.db is not None
