"""OpenAI LLM client implementation."""

from typing import Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import LLMError, LLMRateLimitError, LLMAuthError, LLMConnectionError

try:
    from openai import OpenAI, OpenAIError, RateLimitError, AuthenticationError
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

class OpenAILLMClient(BaseLLMClient):
    """OpenAI GPT client implementation."""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        """
        Initialize OpenAI client.
        
        Args:
            api_key: OpenAI API key
            model_name: Model to use (default: gpt-4o)
        
        Raises:
            LLMError: If OpenAI SDK is not installed
        """
        if not OPENAI_AVAILABLE:
            raise LLMError("OpenAI SDK not installed. Run: pip install openai")
        
        super().__init__(api_key, model_name)
        
        if not self.api_key:
            raise LLMAuthError("OpenAI API key is required")
        
        self.client = OpenAI(api_key=self.api_key)
    
    @property
    def provider_name(self) -> str:
        return "OpenAI"
    
    @property
    def default_model(self) -> str:
        return "gpt-4o"
    
    def generate(self, prompt: str) -> str:
        """
        Generate a response using OpenAI GPT.
        
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
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0
            )
            return response.choices[0].message.content
        
        except RateLimitError as e:
            raise LLMRateLimitError(f"OpenAI rate limit exceeded: {e}")
        except AuthenticationError as e:
            raise LLMAuthError(f"OpenAI authentication failed: {e}")
        except OpenAIError as e:
            if "connection" in str(e).lower():
                raise LLMConnectionError(f"OpenAI connection error: {e}")
            raise LLMError(f"OpenAI error: {e}")
        except Exception as e:
            raise LLMError(f"Unexpected error with OpenAI: {e}")
