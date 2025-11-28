"""Unit tests for authentication system"""

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
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth.db"
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


def test_register_user():
    """Test user registration"""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email():
    """Test registration with duplicate email"""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser2",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_login_success():
    """Test successful login"""
    response = client.post(
        "/auth/login",
        json={
            "email_or_username": "testuser",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_wrong_password():
    """Test login with wrong password"""
    response = client.post(
        "/auth/login",
        json={
            "email_or_username": "testuser",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


def test_get_current_user():
    """Test getting current user profile"""
    # First login
    login_response = client.post(
        "/auth/login",
        json={
            "email_or_username": "testuser",
            "password": "testpassword123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Get profile
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"


def test_refresh_token():
    """Test token refresh"""
    # First login
    login_response = client.post(
        "/auth/login",
        json={
            "email_or_username": "testuser",
            "password": "testpassword123"
        }
    )
    refresh_token = login_response.json()["refresh_token"]
    
    # Refresh
    response = client.post(
        f"/auth/refresh?refresh_token={refresh_token}"
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


# Cleanup
def teardown_module(module):
    """Clean up test database"""
    import os
    if os.path.exists("./test_auth.db"):
        os.remove("./test_auth.db")
