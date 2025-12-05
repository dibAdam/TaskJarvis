"""
Quick debug script to test email notifications
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🔍 Email Configuration Check")
print("=" * 50)

# Check SMTP settings
smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
smtp_port = os.getenv("SMTP_PORT", "587")
smtp_user = os.getenv("SMTP_USER")
smtp_pass = os.getenv("SMTP_PASS")

print(f"\n📧 SMTP Configuration:")
print(f"   Host: {smtp_host}")
print(f"   Port: {smtp_port}")
print(f"   User: {smtp_user if smtp_user else '❌ NOT SET'}")
print(f"   Pass: {'✅ SET' if smtp_pass else '❌ NOT SET'}")

if not smtp_user or not smtp_pass:
    print("\n⚠️  Email service is DISABLED")
    print("   Set SMTP_USER and SMTP_PASS in .env file")
    exit(1)

print("\n✅ Email service is ENABLED")

# Test email sending
print("\n📨 Testing email send...")
try:
    from services.email_service import EmailService
    
    email_service = EmailService()
    
    test_email = 'adamdib307@gmail.com'
    
    if test_email:
        print(f"\n📤 Sending test email to {test_email}...")
        result = email_service.send_email(
            to_email=test_email,
            subject="TaskJarvis Test Email",
            body="This is a test email from TaskJarvis notification system. If you received this, email notifications are working!"
        )
        
        if result:
            print("✅ Test email sent successfully!")
            print(f"   Check {test_email} inbox")
        else:
            print("❌ Failed to send test email")
            print("   Check SMTP credentials and settings")
    else:
        print("⏭️  Skipped test email")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 50)
