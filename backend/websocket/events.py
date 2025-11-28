"""WebSocket event handlers for real-time sync"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.auth.jwt_handler import verify_token
from backend.workspaces.models import WorkspaceMember
from backend.websocket.manager import manager
import json

router = APIRouter()


@router.websocket("/ws/{workspace_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    workspace_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time sync
    Requires authentication via query parameter token
    """
    # Verify token
    user_id = verify_token(token, token_type="access")
    if user_id is None:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    # Verify user is member of workspace
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()
    
    if not membership:
        await websocket.close(code=1008, reason="Not a member of this workspace")
        return
    
    # Connect
    await manager.connect(websocket, user_id, workspace_id)
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "workspace_id": workspace_id,
            "user_id": user_id
        })
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                event_type = message.get("type")
                
                # Handle ping/pong for keepalive
                if event_type == "ping":
                    await websocket.send_json({"type": "pong"})
                
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON"
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
