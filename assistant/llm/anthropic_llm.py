"""Anthropic Claude LLM client implementation."""

import time
from typing import Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import LLMError, LLMRateLimitError, LLMAuthError, LLMConnectionError
from taskjarvis_logging.logger import get_logger, log_llm_request, log_llm_response

try:
    from anthropic import Anthropic, APIError, RateLimitError, AuthenticationError
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

logger = get_logger(__name__)

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
        logger.info(f"Anthropic client initialized with model: {self.model_name}")
    
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
        start_time = time.time()
        log_llm_request(logger, self.provider_name, self.model_name, prompt, max_tokens=1024)
        
        try:
            response = self.client.messages.create(
                model=self.model_name,
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            latency = time.time() - start_time
            result = response.content[0].text
            
            # Extract token usage if available
            tokens = None
            if hasattr(response, 'usage') and response.usage:
                tokens = {
                    'input': response.usage.input_tokens,
                    'output': response.usage.output_tokens
                }
            
            log_llm_response(logger, self.provider_name, result, latency, tokens)
            return result
        
        except RateLimitError as e:
            latency = time.time() - start_time
            error_msg = f"Anthropic rate limit exceeded: {e}"
            log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
            raise LLMRateLimitError(error_msg)
        except AuthenticationError as e:
            latency = time.time() - start_time
            error_msg = f"Anthropic authentication failed: {e}"
            log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
            raise LLMAuthError(error_msg)
        except APIError as e:
            latency = time.time() - start_time
            if "connection" in str(e).lower():
                error_msg = f"Anthropic connection error: {e}"
                log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
                raise LLMConnectionError(error_msg)
            error_msg = f"Anthropic error: {e}"
            log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
            raise LLMError(error_msg)
        except Exception as e:
            latency = time.time() - start_time
            error_msg = f"Unexpected error with Anthropic: {e}"
            log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
            raise LLMError(error_msg)
