import subprocess
import time
import sys

inputs = [
    "add a task to buy groceries tomorrow at 5pm",
    "remind me to call my mom in 2 hours",
    "create a task: finish the project report before Friday",
    "set a deadline for reviewing the contract in one hour from now",
    "list my tasks",
    "show all tasks",
    "what do I need to do?",
    "what tasks are pending?",
    "show me tasks for today",
    "list tasks for tomorrow",
    "show tasks for this week",
    "list all tasks from last month",
    "show tasks between January 1st and January 5th",
    "list tasks scheduled after next Monday",
    "list tasks due within the next 2 hours",
    "delete all tasks",
    "delete today's tasks",
    "delete tasks from this week",
    "remove tasks between March 1 and March 10",
    "delete everything before yesterday",
    "delete tasks due in the next hour",
    "complete all tasks",
    "complete the tasks from today",
    "mark tasks from last week as done",
    "delete task 1",
    "remove the task to buy groceries",
    "complete the call my mom task",
    "mark `finish the project report` as done",
    "cls",
    "help",
    "i want to see what i need to do",
    "get rid of everything",
    "wipe my task list",
    "show me",
    "tasks?",
    "set a task to check the oven 1 hour from now",
    "add a reminder in 30 minutes",
    "meeting next Sunday at 8",
    "set a deadline on the first Monday of next month",
    "task: dentist appointment in two weeks",
    "delete all",
    "remove tasks all",
    "i want everything gone",
    "delete that thing we talked about",
    "do it",
    "clean",
    "exit"
]

INTERVAL = 10

# Open output file
with open("test_output.txt", "w") as output_file:
    # Start the process with output going to file
    process = subprocess.Popen(
        [sys.executable, "main.py"],
        stdin=subprocess.PIPE,
        stdout=output_file,  # Write directly to file
        stderr=output_file,  # Errors also to file
        text=True,
        bufsize=1
    )
    
    for cmd in inputs:
        start_time = time.time()
        
        print(f"Sending: {cmd}")
        
        # Send command
        process.stdin.write(cmd + "\n")
        process.stdin.flush()
        
        # Calculate wait time
        elapsed = time.time() - start_time
        wait_time = max(0, INTERVAL - elapsed)
        
        if wait_time > 0:
            print(f"Waiting {wait_time:.2f} seconds...")
            time.sleep(wait_time)
    
    process.stdin.close()
    process.wait()

print("\nOutput saved to test_output.txt")