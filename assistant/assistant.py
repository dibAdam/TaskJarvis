import json
import os
from typing import Dict, Any, Optional, Tuple
from assistant.llm.factory import LLMFactory
from config import settings
from tasks.task_db import TaskDB
from tasks.task import Task
from analytics.dashboard import Dashboard
from taskjarvis_logging.logger import get_logger

logger = get_logger(__name__)

class TaskAssistant:
    def __init__(self, db: TaskDB, provider: Optional[str] = None, model_name: Optional[str] = None):
        self.db = db
        self.dashboard = Dashboard()
        self.show_sql = True  # Toggle SQL visibility
        
        # Get LLM provider (argument overrides settings)
        provider = provider or settings.LLM_PROVIDER
        
        # Get API key based on provider
        api_key_map = {
            "OPENAI": settings.OPENAI_API_KEY,
            "ANTHROPIC": settings.ANTHROPIC_API_KEY,
            "GEMINI": settings.GEMINI_API_KEY,
            "HUGGINGFACE": settings.HUGGINGFACE_API_KEY
        }
        api_key = api_key_map.get(provider.upper())
        
        # Get model name (argument overrides settings)
        if not model_name:
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

    # ============================================================
    # LOWERCASE CONVERSION UTILITIES
    # ============================================================
    
    def _normalize_text_fields(self, text: str) -> str:
        """Convert text to lowercase for storage/queries."""
        return text.lower().strip() if text else text
    
    def _normalize_entities(self, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize all text fields in entities to lowercase."""
        normalized = {}
        for key, value in entities.items():
            if isinstance(value, str) and key in ['title', 'status', 'priority']:
                normalized[key] = self._normalize_text_fields(value)
            else:
                normalized[key] = value
        return normalized

    # ============================================================
    # AI-POWERED SQL GENERATION
    # ============================================================
    
    def _ask_ai_for_sql(self, intent: str, entities: Dict[str, Any], user_input: str) -> Optional[str]:
        """
        Ask the AI to generate the SQL query based on intent and entities.
        This is the AI doing the work, not us!
        """
        from utils.date_parser import get_current_time_str
        
        current_time = get_current_time_str()
        
        # Normalize entities before passing to AI
        normalized_entities = self._normalize_entities(entities)
        
        sql_generation_prompt = f"""
You are an SQL expert. Generate ONLY the SQL query for this task management operation.

DATABASE SCHEMA (PostgreSQL):
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    workspace_id INTEGER,
    assigned_to_id INTEGER
);

IMPORTANT RULES:
- ALL text values MUST be in lowercase (title, status, priority)
- Use lowercase for: 'pending', 'completed', 'low', 'medium', 'high'
- NEVER use uppercase or mixed case like 'Pending', 'Medium', 'Completed'
- Always include created_at and updated_at in INSERT queries

USER REQUEST: {user_input}
DETECTED INTENT: {intent}
EXTRACTED ENTITIES: {json.dumps(normalized_entities)}
CURRENT TIME: {current_time}

INSTRUCTIONS:
- Generate ONLY the SQL query, nothing else
- No markdown, no explanations, no code blocks
- Use single quotes for strings
- ALL string values must be lowercase
- For INSERT: include title (lowercase), and optionally deadline, priority (lowercase), status (lowercase). DO NOT include id.
- For SELECT: use WHERE clauses with lowercase values (status, priority)
- For UPDATE: set status='completed' for complete operations (lowercase)
- For DELETE: use WHERE id = X or delete all if scope is "all"

Examples:
Intent: add_task, Entities: {{"title": "buy milk"}}
Response: INSERT INTO tasks (title, status, priority) VALUES ('buy milk', 'pending', 'medium');

Intent: list_tasks, Entities: {{"status": "pending"}}
Response: SELECT * FROM tasks WHERE LOWER(status) = 'pending';

Intent: delete_task, Entities: {{"id": 5}}
Response: DELETE FROM tasks WHERE id = 5;

Intent: complete_task, Entities: {{"id": 3}}
Response: UPDATE tasks SET status = 'completed' WHERE id = 3;

Now generate the SQL query:
"""
        
        try:
            sql_response = self.llm_client.generate(sql_generation_prompt)
            
            # Clean up the response
            sql_query = sql_response.strip()

            logger.info(f"Generated SQL query: {sql_query}")
            
            # Remove markdown code blocks if present
            if "```sql" in sql_query:
                sql_query = sql_query.split("```sql")[1].split("```")[0].strip()
            elif "```" in sql_query:
                sql_query = sql_query.split("```")[1].split("```")[0].strip()
            
            # Remove any extra text before or after the query
            # Find the first SQL keyword
            sql_keywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
            for keyword in sql_keywords:
                if keyword in sql_query.upper():
                    start_idx = sql_query.upper().find(keyword)
                    sql_query = sql_query[start_idx:]
                    break
            
            # Find the semicolon and cut there
            if ';' in sql_query:
                end_idx = sql_query.find(';')
                sql_query = sql_query[:end_idx + 1]
            
            logger.info(f"AI generated SQL: {sql_query}")
            return sql_query
            
        except Exception as e:
            logger.error(f"Failed to generate SQL with AI: {e}")
            return None

    def _format_sql_output(self, sql: str) -> str:
        """Format SQL query for display to user."""
        return f"\n🔍 [SQL Query Generated by AI]\n{sql}\n"

    def _is_task_intent(self, intent: str) -> bool:
        """Check if intent requires database operation."""
        task_intents = {"add_task", "list_tasks", "delete_task", "complete_task"}
        return intent in task_intents

    # ============================================================
    # MODIFIED: Main Processing - AI Generates Everything
    # ============================================================

    def process_input(self, user_input: str) -> str:
        """
        Process user input with AI-powered SQL generation:
        1. AI detects intent
        2. AI generates SQL query
        3. Execute query and return results
        """
        from utils.date_parser import get_current_time_str
        
        logger.info(f"Processing user input: {user_input[:100]}...")
        
        # Get current time for LLM context
        current_time = get_current_time_str()
        
        # ============================================================
        # STEP 1: AI DETECTS INTENT (existing logic)
        # ============================================================
        
        system_prompt = f"""You are TaskJarvis, a productivity assistant.
Analyze the user's input and extract the intent and entities.

CURRENT TIME: {current_time}

IMPORTANT: When extracting entities, convert all text fields to lowercase:
- title: always lowercase
- status: use 'pending', 'completed', 'in progress' (all lowercase)
- priority: use 'low', 'medium', 'high' (all lowercase)

Intents:
- add_task: Create a new task. Entities: title (REQUIRED, lowercase), deadline (optional), priority (optional, lowercase)
- list_tasks: Show tasks. Entities: status (optional, lowercase), priority (optional, lowercase).
- delete_task: Remove a task. Entities: id (int) or scope ("all").
- complete_task: Mark task as done. Entities: id (int) or scope ("all").
- analytics: Show stats.
- unknown: If unclear or not task-related (normal conversation).

CRITICAL: Respond with ONLY valid JSON. No markdown, no code blocks.

JSON format:
{{"intent": "intent_name", "entities": {{}}, "response": "message"}}

Examples:
{{"intent": "list_tasks", "entities": {{}}, "response": "Here are your tasks."}}
{{"intent": "add_task", "entities": {{"title": "buy groceries"}}, "response": "I'll add that task."}}
{{"intent": "unknown", "entities": {{}}, "response": "I'm a task management assistant. How can I help with your tasks?"}}
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
            ai_response = parsed.get("response", "")
            
            # Additional normalization as safety measure
            entities = self._normalize_entities(entities)
            
            logger.info(f"AI detected intent: {intent} | Entities: {entities}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response was: {llm_response[:1000]}")
            return "💬 Normal Conversation Mode\n\nI'm having trouble understanding. Could you rephrase that?"
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return f"💬 Normal Conversation Mode\n\nError processing request: {e}"

        # ============================================================
        # STEP 2: MODE DETECTION
        # ============================================================
        
        is_task_mode = self._is_task_intent(intent)
        
        if not is_task_mode:
            # NORMAL CONVERSATION MODE
            if intent == "analytics":
                # Special case: analytics
                return f"📊 Analytics Mode\n\n{self._handle_analytics(ai_response)}"
            
            logger.info(f"Normal Conversation Mode: {intent}")
            return f"💬 Normal Conversation Mode\n\n{ai_response}"
        
        # ============================================================
        # STEP 3: AI GENERATES SQL QUERY
        # ============================================================
        
        logger.info(f"Task Manager Mode: {intent}")
        sql_query = self._ask_ai_for_sql(intent, entities, user_input)
        
        if not sql_query:
            return f"❌ Failed to generate SQL query. Please try again."
        
        sql_display = self._format_sql_output(sql_query) if self.show_sql else ""
        
        # ============================================================
        # STEP 4: EXECUTE THE AI-GENERATED SQL
        # ============================================================
        
        try:
            result = self._execute_sql_and_format(intent, sql_query, entities, ai_response)
            return f"📋 Task Manager Mode{sql_display}\n✅ Result:\n{result}"
            
        except Exception as e:
            logger.error(f"Error executing SQL: {e}")
            return f"📋 Task Manager Mode{sql_display}\n❌ Error: {str(e)}"

    # ============================================================
    # SINGLE SQL EXECUTION FUNCTION
    # ============================================================
    
    def _execute_sql_and_format(self, intent: str, sql_query: str, entities: Dict[str, Any], ai_msg: str) -> str:
        """
        Execute the AI-generated SQL query directly on the database.
        Single function handles ALL operations - no routing needed!
        """
        try:
            # Execute the AI-generated SQL using TaskDB's execute_query
            result = self.db.execute_query(sql_query)
            
            # Format response based on query type
            sql_upper = sql_query.upper().strip()
            
            if sql_upper.startswith('INSERT'):
                # For INSERT, we can't easily get the ID unless we use RETURNING
                # But the AI might not generate RETURNING. 
                # We'll just say task added.
                return f"{ai_msg}\n✓ Task added successfully"
            
            elif sql_upper.startswith('SELECT'):
                # Fetch and format results
                rows = result.fetchall()
                
                if not rows:
                    return "No tasks found."
                
                # Format as a table
                output = f"{ai_msg}\n\n"
                output += "ID | Title | Status | Priority | Deadline | Created\n"
                output += "-" * 70 + "\n"
                
                for row in rows:
                    # SQLAlchemy rows are accessed by index or name
                    task_id = row[0]
                    title = row[1]
                    status = row[2] if len(row) > 2 else 'pending'
                    priority = row[3] if len(row) > 3 else 'medium'
                    deadline = row[4] if len(row) > 4 else 'None'
                    created = row[5] if len(row) > 5 else 'N/A'
                    
                    output += f"{task_id} | {title[:30]} | {status} | {priority} | {deadline} | {created}\n"
                
                return output
            
            elif sql_upper.startswith('UPDATE'):
                # Get number of updated rows
                affected = result.rowcount
                return f"{ai_msg}\n✓ {affected} task(s) updated successfully"
            
            elif sql_upper.startswith('DELETE'):
                # Get number of deleted rows
                affected = result.rowcount
                return f"{ai_msg}\n✓ {affected} task(s) deleted successfully"
            
            else:
                return f"{ai_msg}\n✓ Query executed successfully"
                
        except Exception as e:
            logger.error(f"Unexpected error executing SQL: {e}")
            return f"❌ Error: {str(e)}"

    def _handle_analytics(self, ai_msg: str) -> str:
        """Analytics is special - not a direct SQL operation"""
        tasks = self.db.get_tasks()
        stats = self.dashboard.get_stats(tasks)
        self.dashboard.generate_chart(tasks)
        return f"{ai_msg}\n\n{stats}\n(Chart saved to analytics.png)"