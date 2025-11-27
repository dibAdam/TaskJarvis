"""
Simple test script to verify TaskJarvis GUI functionality
Run this to test the GUI without manual interaction
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tasks.task_db import TaskDB
from tasks.task import Task
from assistant.assistant import TaskAssistant
from analytics.dashboard import Dashboard


def test_gui_dependencies():
    """Test that all GUI dependencies are available and working."""
    print("Testing TaskJarvis GUI Dependencies...")
    print("-" * 50)
    
    # Test 1: TaskDB
    print("\n1. Testing TaskDB...")
    try:
        db = TaskDB()
        print("   ✓ TaskDB initialized successfully")
        
        # Test adding a task
        test_task = Task(
            title="Test GUI Task",
            description="Testing GUI integration",
            priority="High",
            deadline="2025-12-01 10:00:00"
        )
        db.add_task(test_task)
        print("   ✓ Task added successfully")
        
        # Test retrieving tasks
        tasks = db.get_tasks()
        print(f"   ✓ Retrieved {len(tasks)} tasks")
        
        # Clean up test task
        if tasks:
            for task in tasks:
                if task.title == "Test GUI Task":
                    db.delete_task(task.id)
                    print("   ✓ Test task cleaned up")
                    break
                    
    except Exception as e:
        print(f"   ✗ TaskDB test failed: {e}")
        return False
        
    # Test 2: TaskAssistant
    print("\n2. Testing TaskAssistant...")
    try:
        assistant = TaskAssistant(db)
        print("   ✓ TaskAssistant initialized successfully")
        
        # Test processing input (will use Mock mode if no API key)
        response = assistant.process_input("list all tasks")
        print(f"   ✓ Assistant processed input: {response[:50]}...")
        
    except Exception as e:
        print(f"   ✗ TaskAssistant test failed: {e}")
        return False
        
    # Test 3: Dashboard
    print("\n3. Testing Dashboard...")
    try:
        dashboard = Dashboard()
        print("   ✓ Dashboard initialized successfully")
        
        # Test getting stats
        tasks = db.get_tasks()
        if tasks:
            stats = dashboard.get_stats(tasks)
            print(f"   ✓ Stats generated: {stats[:50]}...")
        else:
            print("   ✓ Dashboard ready (no tasks to analyze)")
            
    except Exception as e:
        print(f"   ✗ Dashboard test failed: {e}")
        return False
        
    # Test 4: Tkinter availability
    print("\n4. Testing Tkinter...")
    try:
        import tkinter as tk
        root = tk.Tk()
        root.withdraw()  # Hide window
        print("   ✓ Tkinter available")
        root.destroy()
    except Exception as e:
        print(f"   ✗ Tkinter test failed: {e}")
        return False
        
    # Test 5: Matplotlib availability
    print("\n5. Testing Matplotlib...")
    try:
        import matplotlib.pyplot as plt
        from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
        print("   ✓ Matplotlib available")
    except Exception as e:
        print(f"   ✗ Matplotlib test failed: {e}")
        return False
        
    print("\n" + "=" * 50)
    print("All dependency tests passed! ✓")
    print("=" * 50)
    print("\nGUI is ready to run. Execute:")
    print("  python ui\\app.py")
    print()
    
    return True


if __name__ == "__main__":
    success = test_gui_dependencies()
    sys.exit(0 if success else 1)
