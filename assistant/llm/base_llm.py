"""Base class for all LLM clients."""

from abc import ABC, abstractmethod
from typing import Optional

class BaseLLMClient(ABC):
    """
    Abstract base class for all LLM client implementations.
    
    All LLM providers must extend this class and implement the generate method.
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        """
        Initialize the LLM client.
        
        Args:
            api_key: API key for the LLM provider (if required)
            model_name: Name of the model to use
        """
        self.api_key = api_key
        self._model_name = model_name
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the name of the LLM provider (e.g., 'OpenAI', 'Anthropic')."""
        pass
    
    @property
    def model_name(self) -> str:
        """Return the name of the model being used."""
        return self._model_name or self.default_model
    
    @property
    @abstractmethod
    def default_model(self) -> str:
        """Return the default model name for this provider."""
        pass
    
    @abstractmethod
    def generate(self, prompt: str) -> str:
        """
        Generate a response from the LLM.
        
        Args:
            prompt: The input prompt to send to the LLM
            
        Returns:
            The generated response as a string
            
        Raises:
            LLMError: If there's an error generating the response
            LLMRateLimitError: If rate limit is exceeded
            LLMAuthError: If authentication fails
            LLMConnectionError: If there's a connection issue
        """
        pass
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(provider={self.provider_name}, model={self.model_name})"
