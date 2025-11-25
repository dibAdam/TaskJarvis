"""Ollama local LLM client implementation."""

from typing import Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import LLMError, LLMConnectionError

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

class OllamaLLMClient(BaseLLMClient):
    """Ollama local LLM client implementation."""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None, host: str = "http://localhost:11434"):
        """
        Initialize Ollama client.
        
        Args:
            api_key: Not used for Ollama (local)
            model_name: Model to use (default: llama2)
            host: Ollama server host
        
        Raises:
            LLMError: If Ollama SDK is not installed
        """
        if not OLLAMA_AVAILABLE:
            raise LLMError("Ollama SDK not installed. Run: pip install ollama")
        
        super().__init__(api_key, model_name)
        self.host = host
        self.client = ollama.Client(host=self.host)
    
    @property
    def provider_name(self) -> str:
        return "Ollama"
    
    @property
    def default_model(self) -> str:
        return "llama2"
    
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
        try:
            response = self.client.chat(
                model=self.model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response['message']['content']
        
        except Exception as e:
            error_msg = str(e).lower()
            if "connection" in error_msg or "refused" in error_msg:
                raise LLMConnectionError(
                    f"Cannot connect to Ollama at {self.host}. "
                    f"Make sure Ollama is running. Error: {e}"
                )
            else:
                raise LLMError(f"Ollama error: {e}")
