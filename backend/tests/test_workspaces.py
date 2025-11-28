"""Unit tests for workspace operations"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.base import Base
from backend.main import app
from backend.database import get_db
import os

# Set test mode
os.environ["APP_MODE"] = "cloud"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_workspaces.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Global variables for test data
user1_token = None
user2_token = None
workspace_id = None
invitation_token = None


def test_setup_users():
    """Setup test users"""
    global user1_token, user2_token
    
    # Register user 1
    response1 = client.post(
        "/auth/register",
        json={
            "email": "user1@example.com",
            "username": "user1",
            "password": "password123"
        }
    )
    assert response1.status_code == 200
    user1_token = response1.json()["access_token"]
    
    # Register user 2
    response2 = client.post(
        "/auth/register",
        json={
            "email": "user2@example.com",
            "username": "user2",
            "password": "password123"
        }
    )
    assert response2.status_code == 200
    user2_token = response2.json()["access_token"]


def test_create_workspace():
    """Test workspace creation"""
    global workspace_id
    
    response = client.post(
        "/workspaces/",
        headers={"Authorization": f"Bearer {user1_token}"},
        json={
            "name": "Test Workspace",
            "description": "A test workspace"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Workspace"
    assert data["member_count"] == 1
    workspace_id = data["id"]


def test_list_workspaces():
    """Test listing workspaces"""
    response = client.get(
        "/workspaces/",
        headers={"Authorization": f"Bearer {user1_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Workspace"


def test_generate_invitation():
    """Test generating workspace invitation"""
    global invitation_token
    
    response = client.post(
        f"/workspaces/{workspace_id}/invite",
        headers={"Authorization": f"Bearer {user1_token}"},
        json={"email": "user2@example.com"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["workspace_id"] == workspace_id
    invitation_token = data["token"]


def test_join_workspace():
    """Test joining workspace via invitation"""
    response = client.post(
        f"/workspaces/join/{invitation_token}",
        headers={"Authorization": f"Bearer {user2_token}"}
    )
    assert response.status_code == 200
    assert "Successfully joined" in response.json()["message"]


def test_list_workspace_members():
    """Test listing workspace members"""
    response = client.get(
        f"/workspaces/{workspace_id}/members",
        headers={"Authorization": f"Bearer {user1_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_workspace_access_control():
    """Test workspace access control"""
    # User 2 should now be able to access the workspace
    response = client.get(
        f"/workspaces/{workspace_id}",
        headers={"Authorization": f"Bearer {user2_token}"}
    )
    assert response.status_code == 200


# Cleanup
def teardown_module(module):
    """Clean up test database"""
    import os
    if os.path.exists("./test_workspaces.db"):
        os.remove("./test_workspaces.db")
