"""HuggingFace Inference API LLM client implementation."""

from typing import Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import LLMError, LLMRateLimitError, LLMAuthError, LLMConnectionError

try:
    from huggingface_hub import InferenceClient
    HUGGINGFACE_AVAILABLE = True
except ImportError:
    HUGGINGFACE_AVAILABLE = False

class HuggingFaceLLMClient(BaseLLMClient):
    """HuggingFace Inference API client implementation."""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        """
        Initialize HuggingFace client.
        
        Args:
            api_key: HuggingFace API token
            model_name: Model to use (default: meta-llama/Llama-2-7b-chat-hf)
        
        Raises:
            LLMError: If HuggingFace SDK is not installed
        """
        if not HUGGINGFACE_AVAILABLE:
            raise LLMError("HuggingFace Hub SDK not installed. Run: pip install huggingface-hub")
        
        super().__init__(api_key, model_name)
        
        if not self.api_key:
            raise LLMAuthError("HuggingFace API token is required")
        
        self.client = InferenceClient(token=self.api_key)
    
    @property
    def provider_name(self) -> str:
        return "HuggingFace"
    
    @property
    def default_model(self) -> str:
        return "meta-llama/Llama-2-7b-chat-hf"
    
    def generate(self, prompt: str) -> str:
        """
        Generate a response using HuggingFace Inference API.
        
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
            response = self.client.text_generation(
                prompt,
                model=self.model_name,
                max_new_tokens=512
            )
            return response
        
        except Exception as e:
            error_msg = str(e).lower()
            if "rate limit" in error_msg or "429" in error_msg:
                raise LLMRateLimitError(f"HuggingFace rate limit exceeded: {e}")
            elif "unauthorized" in error_msg or "401" in error_msg or "403" in error_msg:
                raise LLMAuthError(f"HuggingFace authentication failed: {e}")
            elif "connection" in error_msg or "network" in error_msg:
                raise LLMConnectionError(f"HuggingFace connection error: {e}")
            else:
                raise LLMError(f"HuggingFace error: {e}")
