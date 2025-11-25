import sys
import os
from dotenv import load_dotenv
from tasks.task_db import TaskDB
from assistant.assistant import TaskAssistant

# Load environment variables
load_dotenv()

def main():
    print("Initializing TaskJarvis AI...")
    
    db = TaskDB()
    assistant = TaskAssistant(db)
    
    print("\nTaskJarvis AI is ready! Type 'help' for commands or just ask naturally.")
    print("Example: 'Add a high priority task to finish the report by Friday'")
    
    while True:
        try:
            user_input = input("\n> ").strip()
            if not user_input:
                continue
            
            if user_input.lower() in ["exit", "quit"]:
                print("Goodbye!")
                break
            
            if user_input.lower() == "help":
                print("You can speak naturally to TaskJarvis.")
                print("Examples:")
                print("  - 'Remind me to call Mom tomorrow'")
                print("  - 'Show my high priority tasks'")
                print("  - 'Delete task 1'")
                print("  - 'How am I doing?' (Analytics)")
                continue

            # Process with AI Assistant
            response = assistant.process_input(user_input)
            print(response)

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
