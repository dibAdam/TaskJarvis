import os
from pathlib import Path

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database
DB_NAME = "tasks.db"
DB_PATH = BASE_DIR / DB_NAME

# Notifications
NOTIFICATION_TIMEOUT = 10  # seconds

# Task Priorities
PRIORITY_LOW = "Low"
PRIORITY_MEDIUM = "Medium"
PRIORITY_HIGH = "High"

DEFAULT_PRIORITY = PRIORITY_MEDIUM

# LLM Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "GEMINI")  # OPENAI, ANTHROPIC, GEMINI, OLLAMA, HUGGINGFACE, MOCK

# API Keys (read from environment variables)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# Ollama Configuration
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# Model Names (optional overrides)
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2")
HUGGINGFACE_MODEL = os.getenv("HUGGINGFACE_MODEL", "meta-llama/Llama-2-7b-chat-hf")
