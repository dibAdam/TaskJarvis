"""
Centralized logging configuration for TaskJarvis.

Provides rotating file logging and console output with proper formatting
and sensitive data filtering.
"""

import logging
import os
import re
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional

# Base directory for logs
LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Log file configuration
LOG_FILE = LOG_DIR / "taskjarvis.log"
MAX_BYTES = 5 * 1024 * 1024  # 5MB
BACKUP_COUNT = 5

# Log format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Sensitive patterns to filter
SENSITIVE_PATTERNS = [
    (re.compile(r'(api[_-]?key["\s:=]+)([a-zA-Z0-9_-]+)', re.IGNORECASE), r'\1***REDACTED***'),
    (re.compile(r'(sk-[a-zA-Z0-9]{20,})', re.IGNORECASE), r'sk-***REDACTED***'),
    (re.compile(r'(Bearer\s+)([a-zA-Z0-9_-]+)', re.IGNORECASE), r'\1***REDACTED***'),
]

class SensitiveDataFilter(logging.Filter):
    """Filter to redact sensitive information from logs."""
    
    def filter(self, record: logging.LogRecord) -> bool:
        """
        Filter log record to remove sensitive data.
        
        Args:
            record: Log record to filter
            
        Returns:
            True (always allow the record, just modify it)
        """
        if isinstance(record.msg, str):
            for pattern, replacement in SENSITIVE_PATTERNS:
                record.msg = pattern.sub(replacement, record.msg)
        
        # Also filter args if present
        if record.args:
            filtered_args = []
            for arg in record.args:
                if isinstance(arg, str):
                    for pattern, replacement in SENSITIVE_PATTERNS:
                        arg = pattern.sub(replacement, arg)
                filtered_args.append(arg)
            record.args = tuple(filtered_args)
        
        return True

def get_logger(name: str, level: Optional[int] = None) -> logging.Logger:
    """
    Get a configured logger instance.
    
    Args:
        name: Name of the logger (typically __name__)
        level: Optional log level override
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Only configure if not already configured
    if not logger.handlers:
        if level is None:
            level = logging.DEBUG
        
        logger.setLevel(level)
        
        # Create formatters
        formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
        
        # Console handler (INFO and above)
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        console_handler.addFilter(SensitiveDataFilter())
        
        # File handler (DEBUG and above, rotating)
        file_handler = RotatingFileHandler(
            LOG_FILE,
            maxBytes=MAX_BYTES,
            backupCount=BACKUP_COUNT,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        file_handler.addFilter(SensitiveDataFilter())
        
        # Add handlers
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
        
        # Prevent propagation to root logger
        logger.propagate = False
    
    return logger

def log_llm_request(logger: logging.Logger, provider: str, model: str, prompt: str, **kwargs):
    """
    Log an LLM request with truncated prompt.
    
    Args:
        logger: Logger instance
        provider: LLM provider name
        model: Model name
        prompt: Input prompt (will be truncated)
        **kwargs: Additional parameters to log
    """
    truncated_prompt = prompt[:200] + "..." if len(prompt) > 200 else prompt
    logger.debug(
        f"LLM Request | Provider: {provider} | Model: {model} | "
        f"Prompt: {truncated_prompt} | Params: {kwargs}"
    )

def log_llm_response(logger: logging.Logger, provider: str, response: str, 
                     latency: float, tokens: Optional[dict] = None, error: Optional[str] = None):
    """
    Log an LLM response with metrics.
    
    Args:
        logger: Logger instance
        provider: LLM provider name
        response: Response text (will be truncated)
        latency: Response time in seconds
        tokens: Optional token usage dict
        error: Optional error message
    """
    if error:
        logger.error(f"LLM Error | Provider: {provider} | Error: {error} | Latency: {latency:.2f}s")
    else:
        truncated_response = response[:200] + "..." if len(response) > 200 else response
        token_info = f" | Tokens: {tokens}" if tokens else ""
        logger.debug(
            f"LLM Response | Provider: {provider} | Latency: {latency:.2f}s{token_info} | "
            f"Response: {truncated_response}"
        )
