import os
from abc import ABC, abstractmethod
import json

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

class LLMClient(ABC):
    @abstractmethod
    def generate_response(self, prompt: str) -> str:
        pass

class OpenAILLMClient(LLMClient):
    def __init__(self, api_key: str):
        if not OpenAI:
            raise ImportError("OpenAI library not installed. Please run 'pip install openai'")
        self.client = OpenAI(api_key=api_key)

    def generate_response(self, prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o", # Or gpt-3.5-turbo if preferred
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return "{}"

class MockLLMClient(LLMClient):
    def generate_response(self, prompt: str) -> str:
        """
        Mock response for testing purposes.
        Tries to guess intent based on simple keywords in the prompt.
        """
        prompt_lower = prompt.lower()
        
        if "add task" in prompt_lower or "remind me" in prompt_lower:
            # Extract title roughly for mock
            return json.dumps({
                "intent": "add_task",
                "entities": {
                    "title": "Mock Task",
                    "deadline": "tomorrow",
                    "priority": "Medium"
                },
                "response": "I've added that task for you (Mock)."
            })
        elif "list" in prompt_lower:
            return json.dumps({
                "intent": "list_tasks",
                "entities": {},
                "response": "Here are your tasks (Mock)."
            })
        elif "delete" in prompt_lower:
             return json.dumps({
                "intent": "delete_task",
                "entities": {"id": 1},
                "response": "Deleted task 1 (Mock)."
            })
        elif "analytics" in prompt_lower:
             return json.dumps({
                "intent": "analytics",
                "entities": {},
                "response": "Showing analytics (Mock)."
            })
            
        return json.dumps({
            "intent": "unknown",
            "entities": {},
            "response": "I didn't understand that (Mock)."
        })
