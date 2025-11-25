import json
import os
from typing import Dict, Any
from assistant.llm.factory import LLMFactory
from config import settings
from tasks.task_db import TaskDB
from tasks.task import Task
from analytics.dashboard import Dashboard
from utils.helpers import format_task_output
from taskjarvis_logging.logger import get_logger

logger = get_logger(__name__)

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
        from utils.date_parser import get_current_time_str
        
        logger.info(f"Processing user input: {user_input[:100]}...")
        
        # Get current time for LLM context
        current_time = get_current_time_str()
        
        system_prompt = f"""
        You are TaskJarvis, a productivity assistant.
        Analyze the user's input and extract the intent and entities.
        
        CURRENT TIME: {current_time}
        
        Intents:
        - add_task: Create a new task. Entities: title (REQUIRED), deadline (extract as "in X hours", "tomorrow" - NOT dates), priority
        - list_tasks: Show tasks. Entities: status (optional).
        - delete_task: Remove a task. Entities: id (int).
        - complete_task: Mark task as done. Entities: id (int).
        - analytics: Show stats.
        - unknown: If unclear or not task-related.

        CRITICAL: Respond with ONLY valid JSON. No markdown, no code blocks.
        For deadlines: "one hour from now" → "in 1 hour"
        
        JSON format:
        {{"intent": "intent_name", "entities": {{}}, "response": "message"}}
        
        Examples:
        {{"intent": "list_tasks", "entities": {{}}, "response": "Here are your tasks."}}
        {{"intent": "add_task", "entities": {{"title": "pick up phone", "deadline": "in 1 hour"}}, "response": "I'll add that task."}}
        """
        
        full_prompt = f"{system_prompt}\n\nUser Input: {user_input}"
        
        try:
            llm_response = self.llm_client.generate(full_prompt)
            logger.debug(f"Raw LLM response: {llm_response[:500]}...")
            
            # Clean up response
            cleaned_response = llm_response.strip()
            
            # Remove markdown code blocks
            if "```json" in cleaned_response:
                cleaned_response = cleaned_response.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned_response:
                cleaned_response = cleaned_response.split("```")[1].split("```")[0].strip()
            
            # Extract JSON if there's extra text
            if not cleaned_response.startswith("{"):
                start_idx = cleaned_response.find("{")
                if start_idx != -1:
                    end_idx = cleaned_response.rfind("}")
                    if end_idx != -1:
                        cleaned_response = cleaned_response[start_idx:end_idx+1]
            
            logger.debug(f"Cleaned response: {cleaned_response[:500]}...")
            
            parsed = json.loads(cleaned_response)
            intent = parsed.get("intent")
            entities = parsed.get("entities", {})
            
            logger.debug(f"Detected intent: {intent} | Entities: {entities}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response was: {llm_response[:1000]}")
            return "I'm having trouble understanding. Could you rephrase that?"
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            logger.error(f"Raw response was: {llm_response[:1000] if 'llm_response' in locals() else 'N/A'}")
            return f"Error processing request: {e}"

        ai_response = parsed.get("response", "")

        # Routing Logic
        logger.debug(f"Routing to handler for intent: {intent}")
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
            logger.warning(f"Unknown intent: {intent}")
            return ai_response

    def _handle_add_task(self, entities: Dict[str, Any], ai_msg: str) -> str:
        from utils.date_parser import parse_deadline
        
        title = entities.get("title")
        if not title:
            return "I need a task title to add it."
        
        # Parse deadline using date parser
        raw_deadline = entities.get("deadline")
        parsed_deadline = parse_deadline(raw_deadline) if raw_deadline else None
        
        if raw_deadline and not parsed_deadline:
            logger.warning(f"Failed to parse deadline: '{raw_deadline}'")
            return f"I couldn't understand the deadline '{raw_deadline}'. Please use a format like 'tomorrow', 'in 2 hours', or 'YYYY-MM-DD HH:MM:SS'."
        
        task = Task(
            title=title,
            deadline=parsed_deadline,
            priority=entities.get("priority", "Medium")
        )
        task_id = self.db.add_task(task)
        
        # Build response with parsed deadline info
        response = f"{ai_msg}\n(Task ID: {task_id}"
        if parsed_deadline:
            response += f", Deadline: {parsed_deadline}"
        response += ")"
        
        return response

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
