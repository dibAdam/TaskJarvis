from services.email_service import EmailService
from services.sms_service import SMSService
from services.desktop_notifier import DesktopNotifier
import logging
import os

logger = logging.getLogger(__name__)

class NotificationManager:
    """Orchestrates sending notifications via enabled channels."""
    
    def __init__(self):
        self.email_service = EmailService()
        self.sms_service = SMSService()
        self.desktop_notifier = DesktopNotifier()
        
    def send_task_reminder(self, task_title: str, task_deadline: str, user_email: str = None, user_phone: str = None) -> dict:
        """
        Send a task reminder through all enabled channels.
        
        Args:
            task_title: Title of the task
            task_deadline: Deadline of the task
            user_email: User's email address (optional)
            user_phone: User's phone number (optional)
            
        Returns:
            dict: Status of each notification channel
        """
        subject = f"Task Reminder: {task_title}"
        message = f"Reminder: Your task '{task_title}' is due at {task_deadline}"
        
        results = {
            'email': False,
            'sms': False,
            'desktop': False
        }
        
        # Send email if user_email is provided
        if user_email:
            results['email'] = self.email_service.send_email(user_email, subject, message)
        
        # Send SMS if user_phone is provided
        if user_phone:
            results['sms'] = self.sms_service.send_sms(user_phone, message)
        
        # Always try desktop notification
        results['desktop'] = self.desktop_notifier.send_notification(subject, message)
        
        logger.info(f"Notification sent for task '{task_title}': {results}")
        return results
