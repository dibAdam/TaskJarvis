import json
import os
from typing import Dict, Any
from assistant.llm.factory import LLMFactory
from config import settings
from tasks.task_db import TaskDB
from tasks.task import Task
from analytics.dashboard import Dashboard
from utils.helpers import format_task_output

class TaskAssistant:
    def __init__(self, db: TaskDB):
        self.db = db
        self.dashboard = Dashboard()
        
        # Get LLM provider from settings
        provider = settings.LLM_PROVIDER
        
        # Get API key based on provider
        api_key_map = {
            "OPENAI": settings.OPENAI_API_KEY,
            "ANTHROPIC": settings.ANTHROPIC_API_KEY,
            "GEMINI": settings.GEMINI_API_KEY,
            "HUGGINGFACE": settings.HUGGINGFACE_API_KEY
        }
        api_key = api_key_map.get(provider.upper())
        
        # Get model name based on provider
        model_map = {
            "OPENAI": settings.OPENAI_MODEL,
            "ANTHROPIC": settings.ANTHROPIC_MODEL,
            "GEMINI": settings.GEMINI_MODEL,
            "OLLAMA": settings.OLLAMA_MODEL,
            "HUGGINGFACE": settings.HUGGINGFACE_MODEL
        }
        model_name = model_map.get(provider.upper())
        
        # Create LLM client with fallback to Mock
        self.llm_client = LLMFactory.create_with_fallback(
            provider=provider,
            api_key=api_key,
            model_name=model_name,
            host=settings.OLLAMA_HOST if provider.upper() == "OLLAMA" else None
        )

    def process_input(self, user_input: str) -> str:
        """
        Process user input, route to appropriate handler, and return response.
        """
        system_prompt = """
        You are TaskJarvis, a productivity assistant.
        Analyze the user's input and extract the intent and entities.
        
        Intents:
        - add_task: Create a new task. Entities: title, deadline (YYYY-MM-DD HH:MM:SS or relative), priority (Low/Medium/High).
        - list_tasks: Show tasks. Entities: status (optional).
        - delete_task: Remove a task. Entities: id (int).
        - complete_task: Mark task as done. Entities: id (int).
        - analytics: Show stats.
        - unknown: If you can't determine the intent.

        Output JSON format ONLY:
        {
            "intent": "intent_name",
            "entities": { ... },
            "response": "A friendly message to the user confirming the action or asking for clarification."
        }
        """
        
        full_prompt = f"{system_prompt}\n\nUser Input: {user_input}"
        
        try:
            llm_response = self.llm_client.generate(full_prompt)
            # Clean up response if it contains markdown code blocks
            if "```json" in llm_response:
                llm_response = llm_response.split("```json")[1].split("```")[0].strip()
            elif "```" in llm_response:
                llm_response = llm_response.split("```")[1].split("```")[0].strip()
                
            parsed = json.loads(llm_response)
        except json.JSONDecodeError:
            return "Error: AI response was not valid JSON."
        except Exception as e:
            return f"Error processing request: {e}"

        intent = parsed.get("intent")
        entities = parsed.get("entities", {})
        ai_response = parsed.get("response", "")

        # Routing Logic
        if intent == "add_task":
            return self._handle_add_task(entities, ai_response)
        elif intent == "list_tasks":
            return self._handle_list_tasks(entities, ai_response)
        elif intent == "delete_task":
            return self._handle_delete_task(entities, ai_response)
        elif intent == "complete_task":
            return self._handle_complete_task(entities, ai_response)
        elif intent == "analytics":
            return self._handle_analytics(ai_response)
        else:
            return ai_response

    def _handle_add_task(self, entities: Dict[str, Any], ai_msg: str) -> str:
        title = entities.get("title")
        if not title:
            return "I need a task title to add it."
        
        task = Task(
            title=title,
            deadline=entities.get("deadline"),
            priority=entities.get("priority", "Medium")
        )
        task_id = self.db.add_task(task)
        return f"{ai_msg}\n(Task ID: {task_id})"

    def _handle_list_tasks(self, entities: Dict[str, Any], ai_msg: str) -> str:
        status = entities.get("status")
        tasks = self.db.get_tasks(status)
        if not tasks:
            return "No tasks found."
        
        output = [ai_msg]
        for t in tasks:
            output.append("-" * 20)
            output.append(format_task_output(t))
        return "\n".join(output)

    def _handle_delete_task(self, entities: Dict[str, Any], ai_msg: str) -> str:
        task_id = entities.get("id")
        if not task_id:
            return "Which task ID should I delete?"
        
        self.db.delete_task(task_id)
        return ai_msg

    def _handle_complete_task(self, entities: Dict[str, Any], ai_msg: str) -> str:
        task_id = entities.get("id")
        if not task_id:
            return "Which task ID should I complete?"
        
        self.db.update_task(task_id, status="Completed")
        return ai_msg

    def _handle_analytics(self, ai_msg: str) -> str:
        tasks = self.db.get_tasks()
        stats = self.dashboard.get_stats(tasks)
        self.dashboard.generate_chart(tasks)
        return f"{ai_msg}\n\n{stats}\n(Chart saved to analytics.png)"
