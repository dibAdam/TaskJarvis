"""Custom exceptions for LLM operations."""

class LLMError(Exception):
    """Base exception for all LLM-related errors."""
    pass

class LLMRateLimitError(LLMError):
    """Raised when the LLM provider rate limit is exceeded."""
    pass

class LLMAuthError(LLMError):
    """Raised when authentication with the LLM provider fails."""
    pass

class LLMConnectionError(LLMError):
    """Raised when there's a connection issue with the LLM provider."""
    pass

class LLMInvalidResponseError(LLMError):
    """Raised when the LLM returns an invalid or unexpected response."""
    pass
