"""Manual verification script for data retrieval functionality."""

from tasks.task_db import TaskDB
from assistant.assistant import TaskAssistant
from tasks.task import Task
from datetime import datetime, timedelta

def setup_test_data():
    """Create test database with sample tasks."""
    db = TaskDB(db_path="test_manual_verification.db")
    
    # Clear any existing data
    db.delete_all_tasks()
    
    current_time = datetime.now()
    
    # Add diverse test tasks
    print("Setting up test data...")
    
    db.add_task(Task(
        title="Urgent client meeting",
        priority="High",
        status="Pending",
        deadline=(current_time + timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")
    ))
    
    db.add_task(Task(
        title="Fix critical bug",
        priority="High",
        status="Pending",
        deadline=(current_time + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
    ))
    
    db.add_task(Task(
        title="Review pull request",
        priority="Medium",
        status="Pending",
        deadline=(current_time + timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
    ))
    
    db.add_task(Task(
        title="Update documentation",
        priority="Medium",
        status="Completed",
        deadline=(current_time - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
    ))
    
    db.add_task(Task(
        title="Organize workspace",
        priority="Low",
        status="Pending"
    ))
    
    db.add_task(Task(
        title="Clean up old files",
        priority="Low",
        status="Completed"
    ))
    
    print(f"✓ Added 6 test tasks\n")
    return db

def test_varied_phrasings(assistant):
    """Test various phrasings for data retrieval."""
    print("=" * 60)
    print("TESTING VARIED PHRASINGS")
    print("=" * 60)
    
    test_cases = [
        "show me the data",
        "I want to check my tasks",
        "get my task list",
        "what tasks do I have",
        "display all tasks",
    ]
    
    for phrase in test_cases:
        print(f"\n📝 User: {phrase}")
        print("-" * 60)
        response = assistant.process_input(phrase)
        print(response)
        print()

def test_filtered_queries(assistant):
    """Test filtered query detection."""
    print("\n" + "=" * 60)
    print("TESTING FILTERED QUERIES")
    print("=" * 60)
    
    test_cases = [
        "show high priority tasks",
        "get my pending tasks",
        "what are my completed tasks",
        "show medium priority tasks",
    ]
    
    for phrase in test_cases:
        print(f"\n📝 User: {phrase}")
        print("-" * 60)
        response = assistant.process_input(phrase)
        print(response)
        print()

def test_stats_requests(assistant):
    """Test statistics requests."""
    print("\n" + "=" * 60)
    print("TESTING STATS REQUESTS")
    print("=" * 60)
    
    test_cases = [
        "show me the data",
        "get stats for my tasks",
    ]
    
    for phrase in test_cases:
        print(f"\n📝 User: {phrase}")
        print("-" * 60)
        response = assistant.process_input(phrase)
        print(response)
        print()

def verify_query_transparency(assistant):
    """Verify that SQL queries are not exposed."""
    print("\n" + "=" * 60)
    print("VERIFYING QUERY TRANSPARENCY")
    print("=" * 60)
    
    print("\n📝 User: show all tasks")
    print("-" * 60)
    response = assistant.process_input("show all tasks")
    print(response)
    
    # Check for SQL keywords
    sql_keywords = ["SELECT", "WHERE", "FROM tasks", "cursor", "execute"]
    found_keywords = [kw for kw in sql_keywords if kw in response]
    
    if found_keywords:
        print(f"\n❌ FAILED: Found SQL keywords in response: {found_keywords}")
    else:
        print(f"\n✓ PASSED: No SQL keywords found in response")

def main():
    """Run manual verification."""
    print("\n" + "=" * 60)
    print("TASKJARVIS DATA RETRIEVAL - MANUAL VERIFICATION")
    print("=" * 60 + "\n")
    
    # Setup
    db = setup_test_data()
    assistant = TaskAssistant(db)
    
    # Run tests
    test_varied_phrasings(assistant)
    test_filtered_queries(assistant)
    test_stats_requests(assistant)
    verify_query_transparency(assistant)
    
    # Cleanup
    db.close()
    
    print("\n" + "=" * 60)
    print("VERIFICATION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
