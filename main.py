import sys
import os
import argparse
from dotenv import load_dotenv
from tasks.task_db import TaskDB
from assistant.assistant import TaskAssistant

# Load environment variables
load_dotenv()

def get_provider_choice():
    """Interactive prompt to select AI provider."""
    providers = ["OPENROUTER", "MOCK"]
    
    print("\nSelect AI Provider:")
    for i, p in enumerate(providers, 1):
        print(f"{i}. {p}")
    
    while True:
        try:
            choice = input("\nEnter number (default 1 - OPENROUTER): ").strip()
            if not choice:
                return "OPENROUTER"
            
            idx = int(choice) - 1
            if 0 <= idx < len(providers):
                return providers[idx]
            print("Invalid selection. Try again.")
        except ValueError:
            print("Please enter a number.")

def main():
    parser = argparse.ArgumentParser(description="TaskJarvis AI Assistant")
    parser.add_argument("--provider", help="AI Provider (OPENROUTER, MOCK)")
    parser.add_argument("--model", help="Specific model name to use")
    args = parser.parse_args()

    print("Initializing TaskJarvis AI...")
    
    # Determine provider
    provider = args.provider
    if not provider:
        # If no arg provided, ask interactively
        provider = get_provider_choice()
    
    print(f"Selected Provider: {provider}")
    if args.model:
        print(f"Selected Model: {args.model}")
    
    try:
        db = TaskDB()
        assistant = TaskAssistant(db, provider=provider, model_name=args.model)
        
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
                
    except Exception as e:
        print(f"\nCritical Error: {e}")
        print("Please check your settings and API keys.")

if __name__ == "__main__":
    main()
