from fastapi import APIRouter, Depends, HTTPException
from api.schemas import ChatRequest, ChatResponse, ConfigRequest, ConfigResponse
from api.dependencies import get_assistant, reset_assistant
from assistant.assistant import TaskAssistant
from backend.auth.dependencies import get_current_user
from backend.users.models import User
import traceback

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    assistant: TaskAssistant = Depends(get_assistant),
    current_user: User = Depends(get_current_user)
):
    try:
        # Set the current user ID in the assistant context
        assistant.current_user_id = current_user.id
        assistant.current_user_email = current_user.email
        
        print(f"🤖 AI Assistant processing for user: {current_user.id} ({current_user.email})")
        
        response = assistant.process_input(request.message)
        # The current assistant returns a string with mixed content (SQL, results, etc.)
        # We'll return it as is for now, but in a real app we might want to parse it better.
        # For this migration, we are wrapping existing logic, so returning the string is correct.
        return ChatResponse(response=response)
    except Exception as e:
        # Print full traceback to help debug
        print(f"❌ ERROR in /assistant/chat endpoint:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Full traceback:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/config", response_model=ConfigResponse)
def configure(config: ConfigRequest):
    try:
        assistant = reset_assistant(provider=config.provider, model_name=config.model_name)
        # Access internal attributes to confirm - a bit hacky but we need to know what happened
        # Since we can't modify the assistant class to expose properties easily without breaking rules
        # We rely on the fact we just set them.
        return ConfigResponse(
            status="updated",
            provider=config.provider,
            model=config.model_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
