"""Invitation token management for workspaces"""

from datetime import datetime, timedelta
from jose import JWTError, jwt
import os

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
INVITATION_TOKEN_EXPIRE_DAYS = 7


def create_invitation_token(workspace_id: int, inviter_id: int) -> str:
    """Generate an invitation token for joining a workspace"""
    expire = datetime.utcnow() + timedelta(days=INVITATION_TOKEN_EXPIRE_DAYS)
    
    to_encode = {
        "workspace_id": workspace_id,
        "inviter_id": inviter_id,
        "exp": expire,
        "type": "invitation"
    }
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_invitation_token(token: str) -> dict | None:
    """
    Validate and decode invitation token
    
    Returns:
        dict with workspace_id and inviter_id if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        workspace_id: int = payload.get("workspace_id")
        inviter_id: int = payload.get("inviter_id")
        token_type: str = payload.get("type")
        
        if workspace_id is None or token_type != "invitation":
            return None
        
        return {
            "workspace_id": workspace_id,
            "inviter_id": inviter_id
        }
    except JWTError:
        return None
