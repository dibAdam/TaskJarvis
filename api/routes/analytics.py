from fastapi import APIRouter, Depends
from api.schemas import AnalyticsResponse
from api.dependencies import get_db
from tasks.task_db import TaskDB
from analytics.dashboard import Dashboard
import os

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/", response_model=AnalyticsResponse)
def get_analytics(db: TaskDB = Depends(get_db)):
    dashboard = Dashboard()
    tasks = db.get_tasks()
    stats = dashboard.get_stats(tasks)
    
    # Generate chart
    # We need to save it to a public static folder for the frontend to access
    # For now, let's save it to 'web-ui/public/analytics.png' if it exists, else local
    # But wait, we can't easily write to web-ui/public from here without knowing the path structure relative to execution
    # Let's stick to the default behavior of generate_chart which saves to current dir, 
    # and we can serve it via StaticFiles in main.py
    
    dashboard.generate_chart(tasks, filename="analytics.png")
    
    return AnalyticsResponse(
        stats=stats,
        chart_path="/static/analytics.png"
    )
