"""Workspace collaboration routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.database import get_db
from backend.auth.dependencies import get_current_user
from backend.users.models import User
from backend.workspaces.models import Workspace, WorkspaceMember, WorkspaceRole
from backend.workspaces.schemas import (
    WorkspaceCreate, WorkspaceResponse, WorkspaceInvite, 
    InvitationTokenResponse, WorkspaceMemberResponse
)
from backend.workspaces.invitations import create_invitation_token, verify_invitation_token
from typing import List

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("/", response_model=WorkspaceResponse)
def create_workspace(
    workspace_data: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new workspace"""
    new_workspace = Workspace(
        name=workspace_data.name,
        description=workspace_data.description,
        owner_id=current_user.id
    )
    
    db.add(new_workspace)
    db.commit()
    db.refresh(new_workspace)
    
    # Add creator as owner member
    owner_member = WorkspaceMember(
        workspace_id=new_workspace.id,
        user_id=current_user.id,
        role=WorkspaceRole.OWNER,
        joined_at=datetime.utcnow()
    )
    
    db.add(owner_member)
    db.commit()
    
    return WorkspaceResponse(
        id=new_workspace.id,
        name=new_workspace.name,
        description=new_workspace.description,
        owner_id=new_workspace.owner_id,
        created_at=new_workspace.created_at,
        member_count=1
    )


@router.get("/", response_model=List[WorkspaceResponse])
def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all workspaces the current user is a member of"""
    memberships = db.query(WorkspaceMember).filter(
        WorkspaceMember.user_id == current_user.id
    ).all()
    
    workspaces = []
    for membership in memberships:
        workspace = db.query(Workspace).filter(Workspace.id == membership.workspace_id).first()
        if workspace:
            member_count = db.query(WorkspaceMember).filter(
                WorkspaceMember.workspace_id == workspace.id
            ).count()
            
            workspaces.append(WorkspaceResponse(
                id=workspace.id,
                name=workspace.name,
                description=workspace.description,
                owner_id=workspace.owner_id,
                created_at=workspace.created_at,
                member_count=member_count
            ))
    
    return workspaces


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get workspace details"""
    # Check if user is a member
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this workspace"
        )
    
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    member_count = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id
    ).count()
    
    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        description=workspace.description,
        owner_id=workspace.owner_id,
        created_at=workspace.created_at,
        member_count=member_count
    )


@router.post("/{workspace_id}/invite", response_model=InvitationTokenResponse)
def invite_to_workspace(
    workspace_id: int,
    invite_data: WorkspaceInvite,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite a user to workspace by email (requires admin role)"""
    # Check if user is admin or owner
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace admins can invite users"
        )
    
    # Generate invitation token
    token = create_invitation_token(workspace_id, current_user.id)
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    return InvitationTokenResponse(
        token=token,
        workspace_id=workspace_id,
        expires_at=expires_at
    )


@router.post("/join/{token}")
def join_workspace(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a workspace using an invitation token"""
    # Verify token
    token_data = verify_invitation_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invitation token"
        )
    
    workspace_id = token_data["workspace_id"]
    
    # Check if workspace exists
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    # Check if already a member
    existing_membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id
    ).first()
    
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already a member of this workspace"
        )
    
    # Add user as member
    new_member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=current_user.id,
        role=WorkspaceRole.MEMBER,
        joined_at=datetime.utcnow()
    )
    
    db.add(new_member)
    db.commit()
    
    return {"message": "Successfully joined workspace", "workspace_id": workspace_id}


@router.get("/{workspace_id}/members", response_model=List[WorkspaceMemberResponse])
def list_workspace_members(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all members of a workspace"""
    # Check if user is a member
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this workspace"
        )
    
    members = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id
    ).all()
    
    result = []
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        if user:
            result.append(WorkspaceMemberResponse(
                id=member.id,
                user_id=user.id,
                username=user.username,
                email=user.email,
                role=member.role.value,
                joined_at=member.joined_at
            ))
    
    return result


@router.delete("/{workspace_id}/members/{user_id}")
def remove_workspace_member(
    workspace_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a member from workspace (requires admin role)"""
    # Check if current user is admin or owner
    current_membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id
    ).first()
    
    if not current_membership or current_membership.role not in [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace admins can remove members"
        )
    
    # Cannot remove owner
    target_membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()
    
    if not target_membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    if target_membership.role == WorkspaceRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot remove workspace owner"
        )
    
    db.delete(target_membership)
    db.commit()
    
    return {"message": "Member removed successfully"}
