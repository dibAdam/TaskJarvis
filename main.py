import sys
from tasks.task import Task
from tasks.task_db import TaskDB
from nlp.parser import CommandParser
from notifications.notifier import Notifier
from analytics.dashboard import Dashboard
from utils.helpers import format_task_output

def main():
    print("Initializing TaskJarvis...")
    
    db = TaskDB()
    parser = CommandParser()
    notifier = Notifier()
    dashboard = Dashboard()
    
    print("TaskJarvis is ready! Type 'help' for commands.")
    
    while True:
        try:
            user_input = input("\n> ").strip()
            if not user_input:
                continue
            
            if user_input.lower() in ["exit", "quit"]:
                print("Goodbye!")
                break
            
            if user_input.lower() == "help":
                print("Commands:")
                print("  - Add task [title] [deadline]")
                print("  - List tasks")
                print("  - Complete task [id]")
                print("  - Delete task [id]")
                print("  - Show analytics")
                print("  - Remind me to [task] [time]")
                continue

            if user_input.lower() in ["stats", "analytics", "show analytics"]:
                tasks = db.get_tasks()
                print(dashboard.get_stats(tasks))
                dashboard.generate_chart(tasks)
                continue

            # Parse Command
            parsed = parser.parse(user_input)
            intent = parsed["intent"]
            entities = parsed["entities"]
            
            if intent == "add":
                if not entities.get("title"):
                    print("Error: Could not extract task title.")
                    continue
                
                task = Task(
                    title=entities["title"],
                    deadline=entities.get("deadline"),
                    priority=entities.get("priority", "Medium")
                )
                task_id = db.add_task(task)
                print(f"Task added with ID: {task_id}")
                if task.deadline:
                    print(f"Deadline set for: {task.deadline}")
                    notifier.send_notification("Task Added", f"Added: {task.title}")
            
            elif intent == "list":
                tasks = db.get_tasks()
                if not tasks:
                    print("No tasks found.")
                else:
                    for t in tasks:
                        print(format_task_output(t))
                        print("-" * 20)
            
            elif intent == "complete":
                task_id = entities.get("id")
                if task_id:
                    db.update_task(task_id, status="Completed")
                    print(f"Task {task_id} marked as completed.")
                    notifier.send_notification("Task Completed", f"Task {task_id} finished!")
                else:
                    print("Error: Please specify a task ID (e.g., 'complete task 1').")
            
            elif intent == "delete":
                task_id = entities.get("id")
                if task_id:
                    db.delete_task(task_id)
                    print(f"Task {task_id} deleted.")
                else:
                    print("Error: Please specify a task ID (e.g., 'delete task 1').")
            
            else:
                print("I didn't understand that command. Try 'help'.")

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
