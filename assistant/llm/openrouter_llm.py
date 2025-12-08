"""OpenRouter LLM client implementation.

This is a unified client that uses OpenRouter's API to access 100+ AI models
through a single interface. It uses the OpenAI SDK configured for OpenRouter's
base URL for compatibility.
"""

import os
import time
from typing import List, Dict, Any, Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import (
    LLMError, 
    LLMAuthError, 
    LLMRateLimitError, 
    LLMConnectionError
)
from taskjarvis_logging.logger import get_logger

logger = get_logger(__name__)

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class OpenRouterLLMClient(BaseLLMClient):
    """OpenRouter LLM client - unified interface for 100+ models."""
    
    def __init__(
        self, 
        api_key: Optional[str] = None, 
        model_name: Optional[str] = None,
        max_retries: int = 3,
        retry_delay: float = 1.0,
        timeout: int = 60
    ):
        """
        Initialize OpenRouter client.
        
        Args:
            api_key: OpenRouter API key
            model_name: Model to use (e.g., 'anthropic/claude-3.5-sonnet')
            max_retries: Maximum number of retry attempts
            retry_delay: Initial delay between retries (exponential backoff)
            timeout: Request timeout in seconds
            
        Raises:
            LLMError: If OpenAI SDK is not installed
            LLMAuthError: If API key is missing
        """
        if not OPENAI_AVAILABLE:
            raise LLMError("OpenAI SDK not installed. Run: pip install openai")
        
        if not api_key:
            api_key = os.getenv("OPENROUTER_API_KEY")
        
        if not api_key:
            raise LLMAuthError("OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable.")
        
        super().__init__(api_key, model_name)
        
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.timeout = timeout
        
        # Initialize OpenAI client configured for OpenRouter
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1",
            timeout=self.timeout,
            default_headers={
                "HTTP-Referer": "https://github.com/yourusername/TaskJarvis",  # Optional
                "X-Title": "TaskJarvis"  # Optional - shows in OpenRouter dashboard
            }
        )
        
        logger.info(f"OpenRouter client initialized with model: {self.model_name}")
    
    @property
    def provider_name(self) -> str:
        """Return the provider name."""
        return "OpenRouter"
    
    @property
    def default_model(self) -> str:
        """Return the default model name."""
        return "anthropic/claude-3.5-sonnet"
    
    def generate(
        self, 
        prompt: str, 
        max_tokens: int = 2000, 
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """
        Generate a response using OpenRouter.
        
        Args:
            prompt: The input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0.0 to 2.0)
            **kwargs: Additional parameters for the API
            
        Returns:
            Generated text response
            
        Raises:
            LLMAuthError: If authentication fails
            LLMRateLimitError: If rate limit is exceeded
            LLMConnectionError: If connection fails
            LLMError: For other errors
        """
        messages = [{"role": "user", "content": prompt}]
        
        # Retry logic with exponential backoff
        last_exception = None
        for attempt in range(self.max_retries):
            try:
                logger.debug(f"OpenRouter API call attempt {attempt + 1}/{self.max_retries}")
                
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    **kwargs
                )
                
                content = response.choices[0].message.content
                
                # Log usage if available
                if hasattr(response, 'usage'):
                    logger.debug(
                        f"OpenRouter usage - "
                        f"prompt: {response.usage.prompt_tokens}, "
                        f"completion: {response.usage.completion_tokens}, "
                        f"total: {response.usage.total_tokens}"
                    )
                
                return content
                
            except Exception as e:
                last_exception = e
                error_str = str(e).lower()
                
                # Classify error types
                if "401" in error_str or "unauthorized" in error_str or "invalid api key" in error_str:
                    logger.error(f"OpenRouter authentication failed: {e}")
                    raise LLMAuthError(f"OpenRouter authentication failed. Check your OPENROUTER_API_KEY: {e}")
                
                elif "429" in error_str or "rate limit" in error_str:
                    logger.warning(f"OpenRouter rate limit hit on attempt {attempt + 1}")
                    if attempt < self.max_retries - 1:
                        # Exponential backoff
                        delay = self.retry_delay * (2 ** attempt)
                        logger.info(f"Retrying in {delay} seconds...")
                        time.sleep(delay)
                        continue
                    else:
                        raise LLMRateLimitError(f"OpenRouter rate limit exceeded after {self.max_retries} attempts: {e}")
                
                elif "timeout" in error_str or "connection" in error_str:
                    logger.warning(f"OpenRouter connection error on attempt {attempt + 1}: {e}")
                    if attempt < self.max_retries - 1:
                        delay = self.retry_delay * (2 ** attempt)
                        logger.info(f"Retrying in {delay} seconds...")
                        time.sleep(delay)
                        continue
                    else:
                        raise LLMConnectionError(f"OpenRouter connection failed after {self.max_retries} attempts: {e}")
                
                else:
                    # Unknown error - retry if we have attempts left
                    logger.error(f"OpenRouter error on attempt {attempt + 1}: {e}")
                    if attempt < self.max_retries - 1:
                        delay = self.retry_delay * (2 ** attempt)
                        logger.info(f"Retrying in {delay} seconds...")
                        time.sleep(delay)
                        continue
                    else:
                        raise LLMError(f"OpenRouter error after {self.max_retries} attempts: {e}")
        
        # If we get here, all retries failed
        raise LLMError(f"OpenRouter request failed after {self.max_retries} attempts: {last_exception}")
    
    def generate_with_history(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: int = 2000,
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """
        Generate a response with conversation history.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            **kwargs: Additional parameters
            
        Returns:
            Generated text response
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            # Reuse error handling from generate()
            logger.error(f"OpenRouter chat history error: {e}")
            raise LLMError(f"OpenRouter chat history error: {e}")
