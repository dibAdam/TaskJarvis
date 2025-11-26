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
        
        # Pre-process for bulk operations (more reliable than LLM detection)
        preprocessed = self._preprocess_bulk_operations(user_input)
        if preprocessed:
            intent, entities = preprocessed
            logger.info(f"Pre-processed bulk operation: {intent} with entities {entities}")
            
            # Route directly to handler
            if intent == "delete_task":
                return self._handle_delete_task(entities, "")
            elif intent == "complete_task":
                return self._handle_complete_task(entities, "")
        
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

    def _preprocess_bulk_operations(self, user_input: str):
        """
        Pre-process user input to detect bulk delete/complete operations.
        Returns (intent, entities) tuple if bulk operation detected, None otherwise.
        """
        from assistant.time_parser import parse_time_range
        
        text = user_input.lower().strip()
        
        # Check for delete keywords
        delete_keywords = ['delete', 'remove', 'clear']
        complete_keywords = ['complete', 'finish', 'done', 'mark']
        
        is_delete = any(keyword in text for keyword in delete_keywords)
        is_complete = any(keyword in text for keyword in complete_keywords)
        
        if not (is_delete or is_complete):
            return None
        
        # Check for "all" scope
        if ' all ' in f' {text} ' or text.startswith('all ') or text.endswith(' all'):
            intent = "delete_task" if is_delete else "complete_task"
            return (intent, {"scope": "all"})
        
        # Check for time range patterns
        time_patterns = ['today', 'tomorrow', 'yesterday', 'this week', 'last week', 
                        'this month', 'last month', 'next week', 'next month']
        
        for pattern in time_patterns:
            if pattern in text:
                # Try to parse the time range
                time_range = parse_time_range(pattern)
                if time_range:
                    intent = "delete_task" if is_delete else "complete_task"
                    return (intent, {"time_range": pattern})
        
        # No bulk operation detected
        return None

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
        from assistant.time_parser import parse_time_range
        from utils.helpers import format_task_list_with_summary, format_stats_inline
        
        # Extract filter parameters
        status = entities.get("status")
        priority = entities.get("priority")
        time_range_text = entities.get("time_range")
        show_stats = entities.get("show_stats", False)
        
        # Parse time range if provided
        time_range = None
        if time_range_text:
            time_range = parse_time_range(time_range_text)
            if not time_range:
                logger.warning(f"Could not parse time range: '{time_range_text}'")
        
        # Execute query based on filters (internal - not shown to user)
        if time_range:
            # Use comprehensive filtering with time range
            tasks = self.db.get_tasks_with_filters(
                status=status,
                priority=priority,
                time_range_start=time_range.start,
                time_range_end=time_range.end
            )
            logger.info(f"Retrieved {len(tasks)} tasks for time range {time_range}")
        else:
            # Use basic filtering without time range
            tasks = self.db.get_tasks(status=status, priority=priority)
            logger.info(f"Retrieved {len(tasks)} tasks with filters: status={status}, priority={priority}")
        
        # Build context string for formatting
        context_parts = []
        if status:
            context_parts.append(status.lower())
        if priority:
            context_parts.append(f"{priority.lower()} priority")
        if time_range_text:
            context_parts.append(f"for {time_range_text}")
        
        context = " ".join(context_parts) if context_parts else ""
        
        # Format output (only results shown to user, no query details)
        output = format_task_list_with_summary(tasks, context)
        
        # Add statistics if requested
        if show_stats and tasks:
            stats = format_stats_inline(tasks)
            output = f"{output}\n\n📊 Stats: {stats}"
        
        return output

    def _handle_delete_task(self, entities: Dict[str, Any], ai_msg: str) -> str:
        from assistant.time_parser import parse_time_range
        
        # Check for bulk operations
        scope = entities.get("scope")
        time_range_text = entities.get("time_range")
        task_id = entities.get("id")
        
        # Handle scope-based bulk deletion ("delete all tasks")
        if scope == "all":
            count = self.db.delete_all_tasks()
            logger.info(f"Deleted all tasks: {count} tasks removed")
            return f"Deleted all {count} tasks."
        
        # Handle time-range based deletion ("delete today's tasks")
        if time_range_text:
            time_range = parse_time_range(time_range_text)
            if not time_range:
                return f"I couldn't understand the time range '{time_range_text}'."
            
            count = self.db.delete_tasks_in_range(time_range.start, time_range.end)
            logger.info(f"Deleted {count} tasks in range {time_range}")
            return f"Deleted {count} tasks for {time_range_text}."
        
        # Handle single task deletion by ID
        if not task_id:
            return "Which task ID should I delete?"
        
        self.db.delete_task(task_id)
        logger.info(f"Deleted task ID: {task_id}")
        return ai_msg

    def _handle_complete_task(self, entities: Dict[str, Any], ai_msg: str) -> str:
        from assistant.time_parser import parse_time_range
        
        # Check for bulk operations
        scope = entities.get("scope")
        time_range_text = entities.get("time_range")
        task_id = entities.get("id")
        
        # Handle scope-based bulk completion ("complete all tasks")
        if scope == "all":
            count = self.db.complete_all_tasks()
            logger.info(f"Completed all tasks: {count} tasks marked as completed")
            return f"Marked all {count} tasks as completed."
        
        # Handle time-range based completion ("complete today's tasks")
        if time_range_text:
            time_range = parse_time_range(time_range_text)
            if not time_range:
                return f"I couldn't understand the time range '{time_range_text}'."
            
            count = self.db.complete_tasks_in_range(time_range.start, time_range.end)
            logger.info(f"Completed {count} tasks in range {time_range}")
            return f"Marked {count} tasks as completed for {time_range_text}."
        
        # Handle single task completion by ID
        if not task_id:
            return "Which task ID should I complete?"
        
        self.db.update_task(task_id, status="Completed")
        logger.info(f"Completed task ID: {task_id}")
        return ai_msg

    def _handle_analytics(self, ai_msg: str) -> str:
        tasks = self.db.get_tasks()
        stats = self.dashboard.get_stats(tasks)
        self.dashboard.generate_chart(tasks)
        return f"{ai_msg}\n\n{stats}\n(Chart saved to analytics.png)"
