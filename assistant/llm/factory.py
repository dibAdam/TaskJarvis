"""Factory for creating LLM clients - OpenRouter unified implementation."""

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
            provider: Name of the LLM provider (OPENROUTER, MOCK)
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
        if not api_key and provider == "OPENROUTER":
            api_key = os.getenv("OPENROUTER_API_KEY")
        
        try:
            if provider == "OPENROUTER":
                from assistant.llm.openrouter_llm import OpenRouterLLMClient
                return OpenRouterLLMClient(
                    api_key=api_key, 
                    model_name=model_name,
                    max_retries=kwargs.get("max_retries", 3),
                    retry_delay=kwargs.get("retry_delay", 1.0),
                    timeout=kwargs.get("timeout", 60)
                )
            
            elif provider == "MOCK":
                return MockLLMClient(api_key=api_key, model_name=model_name)
            
            else:
                raise LLMError(f"Unknown provider: {provider}. Valid options: OPENROUTER, MOCK")
        
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
            provider: Primary provider to try (default: OPENROUTER)
            fallback_provider: Fallback provider if primary fails (default: MOCK)
            **kwargs: Arguments to pass to create()
            
        Returns:
            An instance of BaseLLMClient
        """
        try:
            client = LLMFactory.create(provider, **kwargs)
            print(f"✅ AI Assistant: Online ({client.provider_name} - {client.model_name})")
            return client
        except Exception as e:
            print(f"⚠️  Warning: Failed to initialize {provider}: {e}")
            print(f"🔄 Falling back to {fallback_provider}")
            client = LLMFactory.create(fallback_provider, **kwargs)
            print(f"🤖 AI Assistant: Offline Mode ({client.provider_name})")
            return client
