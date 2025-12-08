import os
from pathlib import Path

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Notifications
NOTIFICATION_TIMEOUT = 10  # seconds

# Task Priorities
PRIORITY_LOW = "Low"
PRIORITY_MEDIUM = "Medium"
PRIORITY_HIGH = "High"

DEFAULT_PRIORITY = PRIORITY_MEDIUM

# LLM Configuration - OpenRouter Unified
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "OPENROUTER")  # OPENROUTER, MOCK

# OpenRouter Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3.5-sonnet")

# OpenRouter Model Options (for reference):
# - anthropic/claude-3.5-sonnet (best for structured output, SQL generation)
# - openai/gpt-4o (advanced reasoning)
# - openai/gpt-4o-mini (fast, cost-effective)
# - meta-llama/llama-3.1-70b-instruct (open source, privacy-focused)
# - meta-llama/llama-3.1-8b-instruct (very cost-effective)

# Legacy settings removed:
# - OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY (use OpenRouter instead)
# - OLLAMA_HOST, OLLAMA_MODEL (local models removed)
# - HUGGINGFACE_API_KEY, HUGGINGFACE_MODEL (replaced by OpenRouter)

# PostgreSQL Database (required)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# WebSocket Configuration
WS_HEARTBEAT_INTERVAL = 30  # seconds
