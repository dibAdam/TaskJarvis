"""WebSocket connection manager for real-time sync"""

from fastapi import WebSocket
from typing import Dict, List, Set
import json


class ConnectionManager:
    """Manages WebSocket connections for real-time sync"""
    
    def __init__(self):
        # workspace_id -> set of websockets
        self.workspace_connections: Dict[int, Set[WebSocket]] = {}
        # user_id -> set of websockets
        self.user_connections: Dict[int, Set[WebSocket]] = {}
        # websocket -> (user_id, workspace_id)
        self.connection_info: Dict[WebSocket, tuple] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int, workspace_id: int):
        """Register a new WebSocket connection"""
        await websocket.accept()
        
        # Add to workspace connections
        if workspace_id not in self.workspace_connections:
            self.workspace_connections[workspace_id] = set()
        self.workspace_connections[workspace_id].add(websocket)
        
        # Add to user connections
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(websocket)
        
        # Store connection info
        self.connection_info[websocket] = (user_id, workspace_id)
    
    def disconnect(self, websocket: WebSocket):
        """Unregister a WebSocket connection"""
        if websocket not in self.connection_info:
            return
        
        user_id, workspace_id = self.connection_info[websocket]
        
        # Remove from workspace connections
        if workspace_id in self.workspace_connections:
            self.workspace_connections[workspace_id].discard(websocket)
            if not self.workspace_connections[workspace_id]:
                del self.workspace_connections[workspace_id]
        
        # Remove from user connections
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        # Remove connection info
        del self.connection_info[websocket]
    
    async def broadcast_to_workspace(self, workspace_id: int, message: dict, exclude: WebSocket = None):
        """Send message to all connections in a workspace"""
        if workspace_id not in self.workspace_connections:
            return
        
        message_json = json.dumps(message)
        disconnected = []
        
        for connection in self.workspace_connections[workspace_id]:
            if connection == exclude:
                continue
            try:
                await connection.send_text(message_json)
            except Exception:
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_personal_message(self, user_id: int, message: dict):
        """Send message to all connections of a specific user"""
        if user_id not in self.user_connections:
            return
        
        message_json = json.dumps(message)
        disconnected = []
        
        for connection in self.user_connections[user_id]:
            try:
                await connection.send_text(message_json)
            except Exception:
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)


# Global connection manager instance
manager = ConnectionManager()
