"""
Database seeder for TaskJarvis
Creates default user and sample tasks for testing
"""

from backend.database import SessionLocal, Base, engine
from backend.users.models import User
from backend.tasks.models import Task
from backend.auth.password import hash_password
from datetime import datetime, timedelta

def seed_database():
    """Seed the database with default data"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if default user already exists
        existing_user = db.query(User).filter(User.email == "admin@taskjarvis.com").first()
        
        if existing_user:
            print("✓ Default user already exists")
            user = existing_user
        else:
            # Create default user
            default_user = User(
                email="admin@taskjarvis.com",
                username="admin",
                hashed_password=hash_password("admin123"),
                is_active=True
            )
            
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            user = default_user
            print("✓ Created default user:")
            print(f"  Email: admin@taskjarvis.com")
            print(f"  Username: admin")
            print(f"  Password: admin123")
        
        # Check if tasks already exist for this user
        existing_tasks = db.query(Task).filter(Task.user_id == user.id).count()
        
        if existing_tasks > 0:
            print(f"✓ User already has {existing_tasks} tasks")
        else:
            # Create sample tasks
            sample_tasks = [
                {
                    "title": "Welcome to TaskJarvis!",
                    "description": "This is your first task. Try completing it by clicking the checkmark.",
                    "priority": "High",
                    "status": "Pending",
                    "deadline": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                },
                {
                    "title": "Explore the AI Assistant",
                    "description": "Click on the chat icon to interact with the AI assistant. Try asking it to create a task!",
                    "priority": "Medium",
                    "status": "Pending",
                    "deadline": (datetime.utcnow() + timedelta(days=2)).isoformat(),
                },
                {
                    "title": "Check out the Dashboard",
                    "description": "Switch to the Board tab to see your task analytics and statistics.",
                    "priority": "Low",
                    "status": "Pending",
                    "deadline": (datetime.utcnow() + timedelta(days=3)).isoformat(),
                },
                {
                    "title": "Customize your profile",
                    "description": "Click on your avatar in the top-right to access your profile settings.",
                    "priority": "Low",
                    "status": "Pending",
                    "deadline": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                },
                {
                    "title": "Completed task example",
                    "description": "This task is already completed to show you how completed tasks look.",
                    "priority": "Medium",
                    "status": "Completed",
                    "deadline": (datetime.utcnow() - timedelta(days=1)).isoformat(),
                },
            ]
            
            for task_data in sample_tasks:
                task = Task(
                    user_id=user.id,
                    **task_data
                )
                db.add(task)
            
            db.commit()
            print(f"✓ Created {len(sample_tasks)} sample tasks")
        
        print("\n✅ Database seeding completed successfully!")
        print("\n📝 Login credentials:")
        print("   Email: admin@taskjarvis.com")
        print("   Username: admin")
        print("   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Seeding database...")
    seed_database()


# $env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskJarvisDB"
