"""Ollama local LLM client implementation."""

import time
from typing import Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import LLMError, LLMConnectionError
from taskjarvis_logging.logger import get_logger, log_llm_request, log_llm_response

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

logger = get_logger(__name__)

class OllamaLLMClient(BaseLLMClient):
    """Ollama local LLM client implementation."""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None, host: str = "http://localhost:11434"):
        """
        Initialize Ollama client.
        
        Args:
            api_key: Not used for Ollama (local)
            model_name: Model to use (default: gpt-oss)
            host: Ollama server host
        
        Raises:
            LLMError: If Ollama SDK is not installed
        """
        if not OLLAMA_AVAILABLE:
            raise LLMError("Ollama SDK not installed. Run: pip install ollama")
        
        super().__init__(api_key, model_name)
        self.host = host
        self.client = ollama.Client(host=self.host)
        logger.info(f"Ollama client initialized with model: {self.model_name} at {self.host}")
    
    @property
    def provider_name(self) -> str:
        return "Ollama"
    
    @property
    def default_model(self) -> str:
        return "gpt-oss"
    
    def generate(self, prompt: str) -> str:
        """
        Generate a response using Ollama.
        
        Args:
            prompt: Input prompt
            
        Returns:
            Generated response
            
        Raises:
            LLMConnectionError: If connection to Ollama fails
            LLMError: For other errors
        """
        start_time = time.time()
        log_llm_request(logger, self.provider_name, self.model_name, prompt)
        
        try:
            response = self.client.chat(
                model=self.model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            latency = time.time() - start_time
            result = response['message']['content']
            log_llm_response(logger, self.provider_name, result, latency)
            return result
        
        except Exception as e:
            latency = time.time() - start_time
            error_msg = str(e).lower()
            if "connection" in error_msg or "refused" in error_msg:
                error_msg = f"Cannot connect to Ollama at {self.host}. Make sure Ollama is running. Error: {e}"
                log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
                raise LLMConnectionError(error_msg)
            else:
                error_msg = f"Ollama error: {e}"
                log_llm_response(logger, self.provider_name, "", latency, error=error_msg)
                raise LLMError(error_msg)
