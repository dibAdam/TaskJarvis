from twilio.rest import Client
import os
import logging

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER")
        self.enabled = bool(self.account_sid and self.auth_token and self.from_number)
        
        if self.enabled:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            logger.warning("SMS service disabled: Twilio credentials not set.")

    def send_sms(self, to_number: str, message: str) -> bool:
        """
        Send an SMS notification.
        
        Args:
            to_number: Recipient phone number (E.164 format, e.g., +1234567890)
            message: SMS message text
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.enabled:
            logger.info(f"SMS service disabled. Skipping SMS to {to_number}")
            return False

        try:
            msg = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to_number
            )
            logger.info(f"SMS sent to {to_number}, SID: {msg.sid}")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_number}: {e}")
            return False
