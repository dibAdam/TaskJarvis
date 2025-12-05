"""
Check if the reminder scheduler is running and show pending reminders
"""
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

print("🔍 Scheduler Status Check")
print("=" * 60)

# Check if server is running
print("\n1️⃣  Server Status:")
print("   Check your server terminal for this message:")
print("   ✅ 'INFO: Reminder scheduler started'")
print("   If you see this, the scheduler is running!")

# Check database for tasks with reminders
print("\n2️⃣  Checking Database for Tasks with Reminders...")
try:
    from backend.database import SessionLocal
    from sqlalchemy import text
    
    db = SessionLocal()
    
    # Get tasks with reminders
    query = text("""
        SELECT id, title, deadline, reminder_offset, last_reminded_at, status
        FROM tasks
        WHERE reminder_offset IS NOT NULL
        ORDER BY deadline
    """)
    
    result = db.execute(query)
    tasks = result.fetchall()
    
    if not tasks:
        print("   ⚠️  No tasks with reminders found")
        print("   Create a task with a deadline and reminder offset!")
    else:
        print(f"   ✅ Found {len(tasks)} task(s) with reminders:\n")
        
        now = datetime.utcnow()
        
        for task in tasks:
            task_id, title, deadline, reminder_offset, last_reminded, status = task
            
            print(f"   📋 Task #{task_id}: {title}")
            print(f"      Status: {status}")
            print(f"      Deadline: {deadline}")
            print(f"      Reminder: {reminder_offset} minutes before")
            
            if deadline:
                from datetime import timedelta
                deadline_dt = deadline if isinstance(deadline, datetime) else datetime.fromisoformat(str(deadline).replace('Z', '+00:00'))
                reminder_time = deadline_dt - timedelta(minutes=reminder_offset)
                
                print(f"      Reminder Time: {reminder_time}")
                
                if now >= reminder_time and status.lower() != 'completed':
                    if last_reminded:
                        print(f"      ✅ Already sent at: {last_reminded}")
                    else:
                        print(f"      ⚡ SHOULD TRIGGER NOW!")
                elif status.lower() == 'completed':
                    print(f"      ⏭️  Task completed, no reminder needed")
                else:
                    time_until = reminder_time - now
                    hours = int(time_until.total_seconds() // 3600)
                    minutes = int((time_until.total_seconds() % 3600) // 60)
                    print(f"      ⏰ Will trigger in: {hours}h {minutes}m")
            
            print()
    
    db.close()
    
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Check email configuration
print("\n3️⃣  Email Configuration:")
smtp_user = os.getenv("SMTP_USER")
smtp_pass = os.getenv("SMTP_PASS")

if smtp_user and smtp_pass:
    print(f"   ✅ SMTP configured for: {smtp_user}")
else:
    print(f"   ❌ SMTP not configured")
    print(f"   Set SMTP_USER and SMTP_PASS in .env file")

# Check user email
print("\n4️⃣  User Email in Database:")
try:
    db = SessionLocal()
    query = text("SELECT id, email FROM users LIMIT 5")
    result = db.execute(query)
    users = result.fetchall()
    
    if users:
        for user_id, email in users:
            print(f"   User #{user_id}: {email or '❌ No email set'}")
    else:
        print("   ⚠️  No users found")
    
    db.close()
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("\n📝 How to verify scheduler is running:")
print("   1. Look at server logs for 'Reminder scheduler started'")
print("   2. Create a task with deadline in 5 minutes")
print("   3. Set reminder offset to 2 minutes")
print("   4. Wait 3 minutes and check email")
print("   5. Check server logs for 'Sending reminder for task...'")
print("\n💡 Scheduler checks every 1 minute for due reminders")
