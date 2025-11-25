"""OpenAI LLM client implementation."""

import time
from typing import Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import LLMError, LLMRateLimitError, LLMAuthError, LLMConnectionError
from taskjarvis_logging.logger import get_logger, log_llm_request, log_llm_response

try:
    from openai import OpenAI, OpenAIError, RateLimitError, AuthenticationError
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

logger = get_logger(__name__)

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
        logger.info(f"OpenAI client initialized with model: {self.model_name}")
    
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
        start_time = time.time()
        log_llm_request(logger, self.provider_name, self.model_name, prompt, temperature=0.0)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0
            )
            
            latency = time.time() - start_time
            result = response.choices[0].message.content
            
            # Extract token usage if available
            tokens = None
            if hasattr(response, 'usage') and response.usage:
                tokens = {
                    'prompt': response.usage.prompt_tokens,
                    'completion': response.usage.completion_tokens,
                    'total': response.usage.total_tokens
                }
            
            log_llm_response(logger, self.provider_name, result, latency, tokens)
            return result
        
        except RateLimitError as e:
            latency = time.time() - start_time
            error_msg = f"OpenAI rate limit exceeded: {e}"
            log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
            raise LLMRateLimitError(error_msg)
        except AuthenticationError as e:
            latency = time.time() - start_time
            error_msg = f"OpenAI authentication failed: {e}"
            log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
            raise LLMAuthError(error_msg)
        except OpenAIError as e:
            latency = time.time() - start_time
            if "connection" in str(e).lower():
                error_msg = f"OpenAI connection error: {e}"
                log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
                raise LLMConnectionError(error_msg)
            error_msg = f"OpenAI error: {e}"
            log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
            raise LLMError(error_msg)
        except Exception as e:
            latency = time.time() - start_time
            error_msg = f"Unexpected error with OpenAI: {e}"
            log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
            raise LLMError(error_msg)
