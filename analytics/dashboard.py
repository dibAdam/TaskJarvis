from typing import List
from tasks.task import Task
import matplotlib.pyplot as plt
import os

class Dashboard:
    def get_stats(self, tasks: List[Task]):
        total = len(tasks)
        if total == 0:
            return "No tasks available."
        
        completed = sum(1 for t in tasks if t.status == "Completed")
        pending = total - completed
        completion_rate = (completed / total) * 100
        
        return (
            f"--- Productivity Analytics ---\n"
            f"Total Tasks: {total}\n"
            f"Completed: {completed}\n"
            f"Pending: {pending}\n"
            f"Completion Rate: {completion_rate:.1f}%"
        )

    def generate_chart(self, tasks: List[Task], filename="analytics.png"):
        """Generates a pie chart of task status."""
        if not tasks:
            return
            
        statuses = [t.status for t in tasks]
        status_counts = {s: statuses.count(s) for s in set(statuses)}
        
        labels = status_counts.keys()
        sizes = status_counts.values()
        
        plt.figure(figsize=(6, 6))
        plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140)
        plt.axis('equal')
        plt.title("Task Status Distribution")
        
        try:
            plt.savefig(filename)
            print(f"Chart saved to {os.path.abspath(filename)}")
        except Exception as e:
            print(f"Failed to save chart: {e}")
