"""Factory for creating LLM clients."""

import os
from typing import Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import LLMError
from assistant.llm.mock_llm import MockLLMClient

class LLMFactory:
    """Factory class for creating LLM client instances."""
    
    @staticmethod
    def create(provider: str, api_key: Optional[str] = None, model_name: Optional[str] = None, **kwargs) -> BaseLLMClient:
        """
        Create an LLM client based on the provider name.
        
        Args:
            provider: Name of the LLM provider (OPENAI, ANTHROPIC, GEMINI, OLLAMA, HUGGINGFACE, MOCK)
            api_key: API key for the provider (optional, will try to get from env)
            model_name: Model name to use (optional, uses provider default)
            **kwargs: Additional provider-specific arguments
            
        Returns:
            An instance of BaseLLMClient
            
        Raises:
            LLMError: If provider is invalid or initialization fails
        """
        provider = provider.upper()
        
        # Try to get API key from environment if not provided
        if not api_key:
            env_key_map = {
                "OPENAI": "OPENAI_API_KEY",
                "ANTHROPIC": "ANTHROPIC_API_KEY",
                "GEMINI": "GEMINI_API_KEY",
                "HUGGINGFACE": "HUGGINGFACE_API_KEY"
            }
            if provider in env_key_map:
                api_key = os.getenv(env_key_map[provider])
        
        try:
            if provider == "OPENAI":
                from assistant.llm.openai_llm import OpenAILLMClient
                return OpenAILLMClient(api_key=api_key, model_name=model_name)
            
            elif provider == "ANTHROPIC":
                from assistant.llm.anthropic_llm import AnthropicLLMClient
                return AnthropicLLMClient(api_key=api_key, model_name=model_name)
            
            elif provider == "GEMINI":
                from assistant.llm.gemini_llm import GeminiLLMClient
                return GeminiLLMClient(api_key=api_key, model_name=model_name)
            
            elif provider == "OLLAMA":
                from assistant.llm.ollama_llm import OllamaLLMClient
                host = kwargs.get("host", os.getenv("OLLAMA_HOST", "http://localhost:11434"))
                return OllamaLLMClient(model_name=model_name, host=host)
            
            elif provider == "HUGGINGFACE":
                from assistant.llm.huggingface_llm import HuggingFaceLLMClient
                return HuggingFaceLLMClient(api_key=api_key, model_name=model_name)
            
            elif provider == "MOCK":
                return MockLLMClient(api_key=api_key, model_name=model_name)
            
            else:
                raise LLMError(f"Unknown provider: {provider}. Valid options: OPENAI, ANTHROPIC, GEMINI, OLLAMA, HUGGINGFACE, MOCK")
        
        except LLMError:
            # Re-raise LLM errors as-is
            raise
        except Exception as e:
            # Wrap other exceptions
            raise LLMError(f"Failed to create {provider} client: {e}")
    
    @staticmethod
    def create_with_fallback(provider: str, fallback_provider: str = "MOCK", **kwargs) -> BaseLLMClient:
        """
        Create an LLM client with automatic fallback.
        
        Args:
            provider: Primary provider to try
            fallback_provider: Fallback provider if primary fails (default: MOCK)
            **kwargs: Arguments to pass to create()
            
        Returns:
            An instance of BaseLLMClient
        """
        try:
            client = LLMFactory.create(provider, **kwargs)
            print(f"AI Assistant: Online ({client.provider_name})")
            return client
        except Exception as e:
            print(f"Warning: Failed to initialize {provider}: {e}")
            print(f"Falling back to {fallback_provider}")
            client = LLMFactory.create(fallback_provider, **kwargs)
            print(f"AI Assistant: Offline ({client.provider_name} Mode)")
            return client
