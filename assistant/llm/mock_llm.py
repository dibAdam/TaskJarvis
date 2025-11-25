"""Mock LLM client for testing and fallback."""

import json
from assistant.llm.base_llm import BaseLLMClient

class MockLLMClient(BaseLLMClient):
    """Mock LLM client for testing without API calls."""
    
    def __init__(self, api_key=None, model_name=None):
        """Initialize mock client."""
        super().__init__(api_key, model_name)
    
    @property
    def provider_name(self) -> str:
        return "Mock"
    
    @property
    def default_model(self) -> str:
        return "mock-model"
    
    def generate(self, prompt: str) -> str:
        """
        Generate a mock response based on simple keyword matching.
        
        Args:
            prompt: Input prompt
            
        Returns:
            Mock JSON response
        """
        prompt_lower = prompt.lower()
        
        if "add task" in prompt_lower or "remind me" in prompt_lower:
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
        elif "complete" in prompt_lower:
            return json.dumps({
                "intent": "complete_task",
                "entities": {"id": 1},
                "response": "Completed task 1 (Mock)."
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
