from plyer import notification
import threading

class Notifier:
    def send_notification(self, title, message):
        """Sends a desktop notification."""
        # Run in a separate thread to avoid blocking
        threading.Thread(target=self._notify, args=(title, message)).start()

    def _notify(self, title, message):
        try:
            notification.notify(
                title=title,
                message=message,
                app_name="TaskJarvis",
                timeout=10
            )
        except Exception as e:
            print(f"Failed to send notification: {e}")
