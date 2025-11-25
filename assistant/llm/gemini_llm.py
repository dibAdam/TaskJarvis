"""Google Gemini LLM client implementation."""

from typing import Optional
from assistant.llm.base_llm import BaseLLMClient
from assistant.llm.errors import LLMError, LLMAuthError, LLMConnectionError

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

class GeminiLLMClient(BaseLLMClient):
    """Google Gemini client implementation."""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        """
        Initialize Gemini client.
        
        Args:
            api_key: Google API key
            model_name: Model to use (default: gemini-pro)
        
        Raises:
            LLMError: If Gemini SDK is not installed
        """
        if not GEMINI_AVAILABLE:
            raise LLMError("Google Generative AI SDK not installed. Run: pip install google-generativeai")
        
        super().__init__(api_key, model_name)
        
        if not self.api_key:
            raise LLMAuthError("Google API key is required")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)
    
    @property
    def provider_name(self) -> str:
        return "Google Gemini"
    
    @property
    def default_model(self) -> str:
        return "gemini-pro"
    
    def generate(self, prompt: str) -> str:
        """
        Generate a response using Google Gemini.
        
        Args:
            prompt: Input prompt
            
        Returns:
            Generated response
            
        Raises:
            LLMAuthError: If authentication fails
            LLMConnectionError: If connection fails
            LLMError: For other errors
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        
        except Exception as e:
            error_msg = str(e).lower()
            if "api key" in error_msg or "authentication" in error_msg:
                raise LLMAuthError(f"Gemini authentication failed: {e}")
            elif "connection" in error_msg or "network" in error_msg:
                raise LLMConnectionError(f"Gemini connection error: {e}")
            else:
                raise LLMError(f"Gemini error: {e}")
