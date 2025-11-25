"""Anthropic Claude LLM client implementation."""

from typing import Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import LLMError, LLMRateLimitError, LLMAuthError, LLMConnectionError

try:
    from anthropic import Anthropic, APIError, RateLimitError, AuthenticationError
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

class AnthropicLLMClient(BaseLLMClient):
    """Anthropic Claude client implementation."""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        """
        Initialize Anthropic client.
        
        Args:
            api_key: Anthropic API key
            model_name: Model to use (default: claude-3-5-sonnet-20241022)
        
        Raises:
            LLMError: If Anthropic SDK is not installed
        """
        if not ANTHROPIC_AVAILABLE:
            raise LLMError("Anthropic SDK not installed. Run: pip install anthropic")
        
        super().__init__(api_key, model_name)
        
        if not self.api_key:
            raise LLMAuthError("Anthropic API key is required")
        
        self.client = Anthropic(api_key=self.api_key)
    
    @property
    def provider_name(self) -> str:
        return "Anthropic"
    
    @property
    def default_model(self) -> str:
        return "claude-3-5-sonnet-20241022"
    
    def generate(self, prompt: str) -> str:
        """
        Generate a response using Anthropic Claude.
        
        Args:
            prompt: Input prompt
            
        Returns:
            Generated response
            
        Raises:
            LLMRateLimitError: If rate limit exceeded
            LLMAuthError: If authentication fails
            LLMConnectionError: If connection fails
            LLMError: For other errors
        """
        try:
            response = self.client.messages.create(
                model=self.model_name,
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text
        
        except RateLimitError as e:
            raise LLMRateLimitError(f"Anthropic rate limit exceeded: {e}")
        except AuthenticationError as e:
            raise LLMAuthError(f"Anthropic authentication failed: {e}")
        except APIError as e:
            if "connection" in str(e).lower():
                raise LLMConnectionError(f"Anthropic connection error: {e}")
            raise LLMError(f"Anthropic error: {e}")
        except Exception as e:
            raise LLMError(f"Unexpected error with Anthropic: {e}")
