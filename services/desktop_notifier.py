import logging
import platform
from typing import Optional

logger = logging.getLogger(__name__)

class DesktopNotifier:
    def __init__(self):
        self.system = platform.system()
        
        # Try to import plyer for system notifications
        try:
            from plyer import notification as plyer_notification
            self.plyer_available = True
            self.plyer = plyer_notification
        except ImportError:
            logger.warning("plyer not available. System notifications disabled.")
            self.plyer_available = False
            
    def send_notification(self, title: str, message: str, timeout: int = 10) -> bool:
        """
        Send a desktop notification.
        
        Args:
            title: Notification title
            message: Notification message
            timeout: Notification display duration in seconds
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        # Try system notification first
        if self.plyer_available:
            try:
                self.plyer.notify(
                    title=title,
                    message=message,
                    timeout=timeout
                )
                logger.info(f"System notification sent: {title}")
                return True
            except Exception as e:
                logger.error(f"Failed to send system notification: {e}")
        
        # Fallback to Tkinter toast
        return self._send_tkinter_toast(title, message, timeout)
    
    def _send_tkinter_toast(self, title: str, message: str, timeout: int) -> bool:
        """
        Send a custom toast notification using Tkinter.
        """
        try:
            import tkinter as tk
            from tkinter import ttk
            
            # Create a toplevel window
            toast = tk.Tk()
            toast.title(title)
            toast.attributes('-topmost', True)
            
            # Position in bottom-right corner
            screen_width = toast.winfo_screenwidth()
            screen_height = toast.winfo_screenheight()
            window_width = 300
            window_height = 100
            x = screen_width - window_width - 20
            y = screen_height - window_height - 60
            toast.geometry(f"{window_width}x{window_height}+{x}+{y}")
            
            # Style
            toast.configure(bg='#2c3e50')
            
            # Title label
            title_label = tk.Label(
                toast, 
                text=title, 
                font=('Arial', 12, 'bold'),
                bg='#2c3e50',
                fg='white'
            )
            title_label.pack(pady=(10, 5))
            
            # Message label
            msg_label = tk.Label(
                toast,
                text=message,
                font=('Arial', 10),
                bg='#2c3e50',
                fg='#ecf0f1',
                wraplength=280
            )
            msg_label.pack(pady=(0, 10))
            
            # Auto-close after timeout
            toast.after(timeout * 1000, toast.destroy)
            
            logger.info(f"Tkinter toast notification sent: {title}")
            toast.mainloop()
            return True
        except Exception as e:
            logger.error(f"Failed to send Tkinter toast: {e}")
            return False
