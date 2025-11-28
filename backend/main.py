"""Main FastAPI application with multi-user cloud support"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database
from backend.database import Base, engine

# Import routers
from backend.users.routes import router as auth_router
from backend.workspaces.routes import router as workspaces_router
from backend.tasks.routes import router as tasks_router
from backend.websocket.events import router as websocket_router

# Import legacy routes for backward compatibility
from api.routes import assistant, analytics

app = FastAPI(
    title="TaskJarvis API",
    description="Multi-user cloud-synchronized AI Task Manager",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
def startup_event():
    """Initialize database on startup"""
    Base.metadata.create_all(bind=engine)
    print("TaskJarvis started - PostgreSQL multi-user mode")

# Mount static files for analytics charts
if not os.path.exists("static"):
    os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="."), name="static")

# Include routers
app.include_router(auth_router)
app.include_router(workspaces_router)
app.include_router(tasks_router)
app.include_router(websocket_router)

# Legacy routes for backward compatibility
app.include_router(assistant.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to TaskJarvis API v2.0",
        "database": "postgresql",
        "features": {
            "authentication": True,
            "workspaces": True,
            "real_time_sync": True
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "postgresql"
    }
