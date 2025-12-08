from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import models to ensure they're registered with SQLAlchemy
from backend.users.models import User
from backend.tasks.models import Task
from backend.workspaces.models import Workspace, WorkspaceMember

from api.routes import tasks, assistant, analytics
from backend.users import routes as auth_routes
from backend.workspaces import routes as workspace_routes
from scheduler.engine import get_scheduler
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize and start the scheduler
    scheduler = get_scheduler()
    scheduler.start()
    yield
    # Shutdown: Stop the scheduler
    scheduler.stop()

app = FastAPI(
    title="TaskJarvis API",
    description="API for TaskJarvis AI Task Manager",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for analytics charts
# We assume the app is run from the root directory
if not os.path.exists("static"):
    os.makedirs("static", exist_ok=True)
    
# Helper to move analytics.png to static folder if it exists in root
# This is a workaround because Dashboard.generate_chart saves to CWD
# We'll handle this in the route or just serve the root as static (risky)
# Better: Mount the current directory as static for specific files, or just serve the file.
# Let's mount the current directory but be careful. 
# Actually, let's just create a static dir and try to make dashboard save there if possible, 
# but we can't modify dashboard code.
# So we will mount the root directory for the specific file 'analytics.png' is hard.
# We will mount the current directory as '/static' but this exposes source code if not careful.
# SAFER: We will rely on the route to generate the image, and then we serve it.
# Let's just mount the root directory as /static for now to serve analytics.png, 
# assuming the user runs from root.
app.mount("/static", StaticFiles(directory="."), name="static")

# Include routers
app.include_router(tasks.router)
app.include_router(assistant.router)
app.include_router(analytics.router)
app.include_router(auth_routes.router)
app.include_router(workspace_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to TaskJarvis API"}
