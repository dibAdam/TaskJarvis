"""
TaskJarvis GUI - Modern Premium Interface
Redesigned with CustomTkinter, glassmorphism, and contemporary aesthetics
"""

import customtkinter as ctk
import tkinter as tk
from tkinter import messagebox
import sys
import os
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tasks.task_db import TaskDB
from tasks.task import Task
from assistant.assistant import TaskAssistant
from analytics.dashboard import Dashboard
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.pyplot as plt

# Set CustomTkinter appearance
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")


class ModernTaskJarvisGUI:
    """Modern GUI application for TaskJarvis with premium aesthetics."""
    
    # Modern color palette - Inspired by Notion, Linear, Todoist
    COLORS = {
        # Backgrounds - Copilot inspired deep blues
        'bg_primary': '#030712',
        'bg_secondary': '#0f172a',
        'bg_tertiary': '#1e293b',
        'bg_card': '#111827',
        'glass': '#0b1220',
        
        # Gradients - Electric azure to violet
        'gradient_start': '#1e3a8a',
        'gradient_mid': '#2563eb',
        'gradient_end': '#7c3aed',
        
        # Accent colors
        'primary': '#60a5fa',
        'secondary': '#38bdf8',
        'success': '#34d399',
        'danger': '#f87171',
        'warning': '#fbbf24',
        
        # Text
        'text_primary': '#f8fafc',
        'text_secondary': '#cbd5f5',
        'text_tertiary': '#94a3b8',
        
        # Priority colors
        'priority_high': '#f87171',
        'priority_medium': '#fbbf24',
        'priority_low': '#38bdf8',
        
        # Special effects
        'glow': '#93c5fd',
        'border': '#1f2a44',
        'hover': '#1e1f2b',
        'panel_glow': '#1d4ed8',
    }
    
    # Typography scale
    FONTS = {
        'display': ('Segoe UI', 32, 'bold'),
        'h1': ('Segoe UI', 24, 'bold'),
        'h2': ('Segoe UI', 18, 'bold'),
        'h3': ('Segoe UI', 16, 'bold'),
        'body': ('Segoe UI', 14),
        'body_bold': ('Segoe UI', 14, 'bold'),
        'small': ('Segoe UI', 12),
        'tiny': ('Segoe UI', 10),
        'mono': ('Consolas', 12),
    }
    
    # Spacing system (8px grid)
    SPACING = {
        'xs': 8,
        'sm': 16,
        'md': 24,
        'lg': 32,
        'xl': 48,
    }
    
    def __init__(self, root: ctk.CTk):
        """
        Initialize the modern TaskJarvis GUI.
        
        Args:
            root: The main CustomTkinter window
        """
        self.root = root
        self.root.title("TaskJarvis - AI Task Manager")
        self.root.geometry("1000x750")
        self.root.minsize(800, 600)
        
        # Configure window
        self.root.configure(fg_color=self.COLORS['bg_primary'])
        
        # Initialize database
        self.db = TaskDB()
        
        # Show provider selection dialog
        provider, model_name = self._show_provider_selection()
        
        # Initialize AI assistant with selected provider
        self.assistant = TaskAssistant(self.db, provider=provider, model_name=model_name)
        self.dashboard = Dashboard()
        
        # Store provider info for display
        self.selected_provider = provider
        self.selected_model = model_name
        
        # UI state
        self.selected_task_id: Optional[int] = None
        self.notification_timer: Optional[str] = None
        self.is_loading: bool = False
        
        # Create UI
        self._create_widgets()
        self._setup_keyboard_shortcuts()
        
        # Initial load
        self.refresh_task_list()
        
    def _show_provider_selection(self) -> tuple:
        """
        Show AI provider selection dialog.
        
        Returns:
            Tuple of (provider, model_name)
        """
        # Create selection dialog
        dialog = ctk.CTkToplevel(self.root)
        dialog.title("Select AI Provider")
        dialog.geometry("500x650")
        dialog.configure(fg_color=self.COLORS['bg_primary'])
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center the dialog
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() // 2) - (500 // 2)
        y = (dialog.winfo_screenheight() // 2) - (650 // 2)
        dialog.geometry(f"500x650+{x}+{y}")
        
        # Result storage
        result = {'provider': 'GEMINI', 'model': None}
        
        # Header
        header = ctk.CTkLabel(
            dialog,
            text="🤖 Select AI Provider",
            font=self.FONTS['h1'],
            text_color=self.COLORS['text_primary']
        )
        header.pack(pady=self.SPACING['md'])
        
        # Description
        desc = ctk.CTkLabel(
            dialog,
            text="Choose the AI provider for natural language processing",
            font=self.FONTS['body'],
            text_color=self.COLORS['text_secondary']
        )
        desc.pack(pady=(0, self.SPACING['md']))
        
        # Provider options
        providers = [
            ("OpenAI (GPT-4)", "OPENAI"),
            ("Anthropic (Claude)", "ANTHROPIC"),
            ("Google (Gemini)", "GEMINI"),
            ("Ollama (Local)", "OLLAMA"),
            ("HuggingFace", "HUGGINGFACE"),
            ("Mock (Testing)", "MOCK")
        ]
        
        # Radio button variable
        provider_var = tk.StringVar(value="GEMINI")
        
        # Provider selection frame
        provider_frame = ctk.CTkFrame(dialog, fg_color=self.COLORS['bg_secondary'], corner_radius=12)
        provider_frame.pack(fill=tk.X, padx=self.SPACING['md'], pady=(0, self.SPACING['sm']))
        
        for display_name, provider_code in providers:
            radio = ctk.CTkRadioButton(
                provider_frame,
                text=display_name,
                variable=provider_var,
                value=provider_code,
                font=self.FONTS['body'],
                text_color=self.COLORS['text_primary'],
                fg_color=self.COLORS['primary'],
                hover_color=self.COLORS['secondary']
            )
            radio.pack(anchor='w', padx=self.SPACING['md'], pady=self.SPACING['xs'])
        
        # Model name input (optional)
        model_label = ctk.CTkLabel(
            dialog,
            text="Custom Model Name (Optional)",
            font=self.FONTS['body_bold'],
            text_color=self.COLORS['text_primary']
        )
        model_label.pack(anchor='w', padx=self.SPACING['md'], pady=(self.SPACING['sm'], self.SPACING['xs']))
        
        model_input = ctk.CTkEntry(
            dialog,
            height=40,
            font=self.FONTS['body'],
            fg_color=self.COLORS['bg_tertiary'],
            text_color=self.COLORS['text_primary'],
            border_width=2,
            border_color=self.COLORS['border'],
            corner_radius=8,
            placeholder_text="e.g., gpt-4o, claude-3-5-sonnet-20241022"
        )
        model_input.pack(fill=tk.X, padx=self.SPACING['md'], pady=(0, self.SPACING['md']))
        
        # Info text
        info = ctk.CTkLabel(
            dialog,
            text="💡 Tip: Leave model name empty to use the default for your provider",
            font=self.FONTS['small'],
            text_color=self.COLORS['text_tertiary'],
            wraplength=450
        )
        info.pack(pady=(0, self.SPACING['md']))
        
        # Button frame
        button_frame = ctk.CTkFrame(dialog, fg_color="transparent")
        button_frame.pack(pady=self.SPACING['md'])
        
        def on_confirm():
            result['provider'] = provider_var.get()
            model_text = model_input.get().strip()
            result['model'] = model_text if model_text else None
            dialog.destroy()
        
        # Confirm button
        confirm_btn = ctk.CTkButton(
            button_frame,
            text="→ Next",
            command=on_confirm,
            font=self.FONTS['body_bold'],
            fg_color=self.COLORS['success'],
            hover_color=self._darken_color(self.COLORS['success']),
            corner_radius=8,
            height=40,
            width=200
        )
        confirm_btn.pack(pady=self.SPACING['sm'])
        
        # Wait for dialog to close
        self.root.wait_window(dialog)
        
        return result['provider'], result['model']
        
    def _create_widgets(self) -> None:
        """Create Copilot-inspired layout."""
        root_shell = ctk.CTkFrame(self.root, fg_color=self.COLORS['bg_primary'])
        root_shell.pack(fill=tk.BOTH, expand=True)
        
        main_layout = ctk.CTkFrame(root_shell, fg_color=self.COLORS['bg_primary'])
        main_layout.pack(fill=tk.BOTH, expand=True)
        
        self._create_sidebar(main_layout)
        
        content_area = ctk.CTkFrame(main_layout, fg_color=self.COLORS['bg_primary'])
        content_area.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        self._create_topbar(content_area)
        
        body = ctk.CTkFrame(content_area, fg_color=self.COLORS['bg_primary'])
        body.pack(fill=tk.BOTH, expand=True, padx=self.SPACING['md'], pady=(0, self.SPACING['md']))
        
        primary_column = ctk.CTkFrame(body, fg_color=self.COLORS['bg_primary'])
        primary_column.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, self.SPACING['md']))
        
        self._create_hero(primary_column)
        self._create_quick_actions(primary_column)
        self._create_task_feed(primary_column)
        
        secondary_column = ctk.CTkFrame(body, fg_color=self.COLORS['bg_primary'], width=260)
        secondary_column.pack(side=tk.LEFT, fill=tk.Y)
        secondary_column.pack_propagate(False)
        self._create_right_panel(secondary_column)
        
        self._create_composer(content_area)
        self._create_notification_area()
        
    def _create_sidebar(self, parent: ctk.CTkFrame) -> None:
        """Create vertical navigation similar to Copilot."""
        sidebar = ctk.CTkFrame(
            parent,
            width=80,
            fg_color=self.COLORS['bg_secondary'],
            corner_radius=24
        )
        sidebar.pack(side=tk.LEFT, fill=tk.Y, padx=self.SPACING['md'], pady=self.SPACING['md'])
        sidebar.pack_propagate(False)
        
        logo = ctk.CTkLabel(
            sidebar,
            text="🪄",
            font=self.FONTS['display'],
            text_color=self.COLORS['primary']
        )
        logo.pack(pady=(self.SPACING['sm'], self.SPACING['lg']))
        
        nav_items = [
            ("Tasks", "📝", self.refresh_task_list, "View all tasks"),
            ("Ask", "💬", self.run_assistant, "Chat with AI Assistant"),
            ("Insights", "📊", self.show_analytics, "View productivity stats"),
            ("Complete", "✅", lambda: self.show_notification("Track completed tasks in the feed", "info"), "Show completed tasks")
        ]
        
        for label, icon, action, tooltip_text in nav_items:
            btn = ctk.CTkButton(
                sidebar,
                text=icon,
                width=48,
                height=48,
                fg_color=self.COLORS['bg_tertiary'],
                hover_color=self.COLORS['hover'],
                corner_radius=16,
                command=action,
                font=self.FONTS['h2'],
                text_color=self.COLORS['text_primary']
            )
            btn.pack(pady=self.SPACING['xs'])
            Tooltip(btn, tooltip_text)
        
        refresh_btn = ctk.CTkButton(
            sidebar,
            text="↻",
            command=self.refresh_task_list,
            width=48,
            height=48,
            fg_color="transparent",
            border_width=1,
            border_color=self.COLORS['border'],
            hover_color=self.COLORS['hover'],
            corner_radius=16,
            text_color=self.COLORS['text_secondary']
        )
        refresh_btn.pack(side=tk.BOTTOM, pady=self.SPACING['sm'])
        self.refresh_btn = refresh_btn
        
    def _create_topbar(self, parent: ctk.CTkFrame) -> None:
        """Create Copilot-style top bar with status."""
        topbar = ctk.CTkFrame(parent, fg_color="transparent")
        topbar.pack(fill=tk.X, padx=self.SPACING['md'], pady=(self.SPACING['md'], self.SPACING['sm']))
        
        title = ctk.CTkLabel(
            topbar,
            text="Jarvis for Tasks",
            font=self.FONTS['h1'],
            text_color=self.COLORS['text_primary']
        )
        title.pack(side=tk.LEFT)
        
        self.task_count_label = ctk.CTkLabel(
            topbar,
            text="0 tasks",
            font=self.FONTS['body'],
            text_color=self.COLORS['text_secondary']
        )
        self.task_count_label.pack(side=tk.LEFT, padx=(self.SPACING['xs'], 0))
        
        status_chip = ctk.CTkFrame(
            topbar,
            fg_color=self.COLORS['bg_tertiary'],
            corner_radius=16
        )
        status_chip.pack(side=tk.RIGHT)
        
        model_info = f"{self.selected_provider} · {self.selected_model}" if self.selected_model else self.selected_provider
        status_label = ctk.CTkLabel(
            status_chip,
            text=f"Connected: {model_info}",
            font=self.FONTS['small'],
            text_color=self.COLORS['text_secondary']
        )
        status_label.pack(padx=self.SPACING['sm'], pady=self.SPACING['xs'])
        
    def _draw_gradient(self, canvas: tk.Canvas, color1: str, color2: str) -> None:
        """Draw horizontal gradient for hero/headers."""
        canvas.update()
        width = max(canvas.winfo_width(), 1)
        height = canvas.winfo_height()
        
        r1, g1, b1 = int(color1[1:3], 16), int(color1[3:5], 16), int(color1[5:7], 16)
        r2, g2, b2 = int(color2[1:3], 16), int(color2[3:5], 16), int(color2[5:7], 16)
        
        for i in range(width):
            ratio = i / width
            r = int(r1 + (r2 - r1) * ratio)
            g = int(g1 + (g2 - g1) * ratio)
            b = int(b1 + (b2 - b1) * ratio)
            color = f'#{r:02x}{g:02x}{b:02x}'
            canvas.create_line(i, 0, i, height, fill=color)
        
    def _create_hero(self, parent: ctk.CTkFrame) -> None:
        """Create hero card with gradient similar to Copilot welcome."""
        hero = ctk.CTkFrame(
            parent,
            fg_color=self.COLORS['gradient_start'],
            corner_radius=24,
            height=140
        )
        hero.pack(fill=tk.X, pady=(0, self.SPACING['md']))
        hero.pack_propagate(False)
        
        hero_canvas = tk.Canvas(hero, bg=self.COLORS['gradient_start'], highlightthickness=0)
        hero_canvas.pack(fill=tk.BOTH, expand=True)
        self._draw_gradient(hero_canvas, self.COLORS['gradient_start'], self.COLORS['gradient_end'])
        
        overlay = ctk.CTkFrame(hero, fg_color="transparent")
        overlay.place(relx=0.05, rely=0.5, anchor="w")
        
        hero_label = ctk.CTkLabel(
            overlay,
            text="Hello, I'm your Jarvis for tasks.\nHow can I help today?",
            font=self.FONTS['h2'],
            text_color=self.COLORS['text_primary'],
            justify=tk.LEFT
        )
        hero_label.pack(anchor="w")
        
        hero_hint = ctk.CTkLabel(
            overlay,
            text="Draft new tasks, summarize workload, or ask for insights.",
            font=self.FONTS['body'],
            text_color=self.COLORS['text_secondary']
        )
        hero_hint.pack(anchor="w", pady=(self.SPACING['xs'], 0))
        
    def _create_quick_actions(self, parent: ctk.CTkFrame) -> None:
        """Quick action pills similar to Copilot suggestions."""
        actions_frame = ctk.CTkFrame(parent, fg_color=self.COLORS['bg_secondary'], corner_radius=18)
        actions_frame.pack(fill=tk.X, pady=(0, self.SPACING['md']))
        
        pills = [
            ("Plan my day", "Plan high priority tasks"),
            ("What's overdue?", "Show overdue tasks"),
            ("Summarize week", "Summarize this week's tasks"),
        ]
        
        for label, prompt in pills:
            pill = ctk.CTkButton(
                actions_frame,
                text=label,
                command=lambda p=prompt: self._use_quick_prompt(p),
                fg_color=self.COLORS['bg_tertiary'],
                hover_color=self.COLORS['hover'],
                corner_radius=24,
                height=36,
                font=self.FONTS['small'],
                text_color=self.COLORS['text_secondary']
            )
            pill.pack(side=tk.LEFT, padx=self.SPACING['xs'], pady=self.SPACING['xs'])
        
        self.assistant_input = ctk.CTkEntry(
            actions_frame,
            height=40,
            font=self.FONTS['body'],
            fg_color=self.COLORS['bg_tertiary'],
            text_color=self.COLORS['text_primary'],
            border_width=1,
            border_color=self.COLORS['border'],
            corner_radius=12,
            placeholder_text="Ask TaskJarvis anything..."
        )
        self.assistant_input.pack(side=tk.RIGHT, padx=self.SPACING['sm'], pady=self.SPACING['xs'])
        self.assistant_input.bind("<FocusIn>", lambda e: self.assistant_input.configure(border_color=self.COLORS['glow']))
        self.assistant_input.bind("<FocusOut>", lambda e: self.assistant_input.configure(border_color=self.COLORS['border']))
        
        ask_btn = ctk.CTkButton(
            actions_frame,
            text="Ask TaskJarvis",
            command=self.run_assistant,
            fg_color=self.COLORS['primary'],
            hover_color=self._darken_color(self.COLORS['primary']),
            corner_radius=12,
            height=40,
            font=self.FONTS['body_bold']
        )
        ask_btn.pack(side=tk.RIGHT, padx=(self.SPACING['xs'], self.SPACING['sm']), pady=self.SPACING['xs'])
        self.run_assistant_btn = ask_btn
        
    def _use_quick_prompt(self, prompt: str) -> None:
        """Fill assistant input with quick prompt."""
        self.assistant_input.delete(0, tk.END)
        self.assistant_input.insert(0, prompt)
        self.run_assistant()
        
    def _create_task_feed(self, parent: ctk.CTkFrame) -> None:
        """Scrollable feed styled like Copilot chat."""
        feed_container = ctk.CTkFrame(parent, fg_color=self.COLORS['bg_secondary'], corner_radius=24)
        feed_container.pack(fill=tk.BOTH, expand=True)
        
        self.task_feed_frame = ctk.CTkScrollableFrame(
            feed_container,
            fg_color="transparent",
            corner_radius=0,
            scrollbar_button_color=self.COLORS['bg_tertiary'],
            scrollbar_button_hover_color=self.COLORS['hover']
        )
        self.task_feed_frame.pack(fill=tk.BOTH, expand=True, padx=self.SPACING['md'], pady=self.SPACING['md'])
        
    def _create_right_panel(self, parent: ctk.CTkFrame) -> None:
        """Insights panel similar to Copilot right rail."""
        info_panel = ctk.CTkFrame(parent, fg_color=self.COLORS['bg_secondary'], corner_radius=24)
        info_panel.pack(fill=tk.BOTH, expand=True)
        
        header = ctk.CTkLabel(
            info_panel,
            text="Live Insights",
            font=self.FONTS['h3'],
            text_color=self.COLORS['text_primary']
        )
        header.pack(pady=(self.SPACING['md'], self.SPACING['xs']))
        
        self.insights_label = ctk.CTkLabel(
            info_panel,
            text="Jarvis is ready to analyze your tasks.",
            font=self.FONTS['body'],
            text_color=self.COLORS['text_secondary'],
            wraplength=220,
            justify=tk.LEFT
        )
        self.insights_label.pack(padx=self.SPACING['md'], pady=(0, self.SPACING['md']))
        
        analytics_btn = ctk.CTkButton(
            info_panel,
            text="Open Analytics",
            command=self.show_analytics,
            fg_color=self.COLORS['primary'],
            hover_color=self._darken_color(self.COLORS['primary']),
            corner_radius=12
        )
        analytics_btn.pack(padx=self.SPACING['md'], pady=(0, self.SPACING['md']))
        self.analytics_btn = analytics_btn
        
        divider = ctk.CTkFrame(info_panel, height=1, fg_color=self.COLORS['border'])
        divider.pack(fill=tk.X, padx=self.SPACING['md'], pady=self.SPACING['sm'])
        
        self.provider_info = ctk.CTkLabel(
            info_panel,
            text="Provider status pending...",
            font=self.FONTS['small'],
            text_color=self.COLORS['text_tertiary'],
            wraplength=220,
            justify=tk.LEFT
        )
        self.provider_info.pack(padx=self.SPACING['md'], pady=(0, self.SPACING['sm']))
        
    def _create_composer(self, parent: ctk.CTkFrame) -> None:
        """Bottom composer similar to Copilot input."""
        composer = ctk.CTkFrame(parent, fg_color=self.COLORS['glass'], corner_radius=24)
        composer.pack(fill=tk.X, padx=self.SPACING['md'], pady=(self.SPACING['sm'], self.SPACING['md']))
        
        placeholder = "Describe a task or tell Jarvis what to do..."
        self.task_input = ctk.CTkTextbox(
            composer,
            height=80,
            font=self.FONTS['body'],
            fg_color=self.COLORS['bg_tertiary'],
            text_color=self.COLORS['text_secondary'],
            border_width=1,
            border_color=self.COLORS['border'],
            corner_radius=18,
            wrap="word"
        )
        self.task_input.pack(fill=tk.BOTH, expand=True, padx=self.SPACING['md'], pady=self.SPACING['sm'])
        self.task_input.insert("1.0", placeholder)
        self.task_input.bind("<FocusIn>", self._on_task_input_focus_in)
        self.task_input.bind("<FocusOut>", self._on_task_input_focus_out)
        self._task_placeholder = placeholder
        
        actions = ctk.CTkFrame(composer, fg_color="transparent")
        actions.pack(fill=tk.X, padx=self.SPACING['md'], pady=(0, self.SPACING['sm']))
        
        self.add_task_btn = ctk.CTkButton(
            actions,
            text="Create Task",
            command=self.add_task,
            fg_color=self.COLORS['success'],
            hover_color=self._darken_color(self.COLORS['success']),
            corner_radius=16,
            height=44,
            font=self.FONTS['body_bold']
        )
        self.add_task_btn.pack(side=tk.RIGHT, padx=(self.SPACING['xs'], 0))
        
        helper_label = ctk.CTkLabel(
            actions,
            text="Jarvis drafts and organizes tasks automatically.",
            font=self.FONTS['small'],
            text_color=self.COLORS['text_tertiary']
        )
        helper_label.pack(side=tk.LEFT)
        
    def _create_notification_area(self) -> None:
        """Create modern notification toast."""
        self.notification_frame = ctk.CTkFrame(
            self.root,
            fg_color=self.COLORS['primary'],
            corner_radius=12,
            height=0
        )
        # Will be shown via place() when needed
        
    def _create_task_card(self, task: Task) -> ctk.CTkFrame:
        """
        Create a modern task card with glassmorphism effect.
        
        Args:
            task: Task object to display
            
        Returns:
            Task card frame
        """
        # Card container with shadow effect
        card = ctk.CTkFrame(
            self.task_feed_frame,
            fg_color=self.COLORS['bg_card'],
            corner_radius=18,
            border_width=1,
            border_color=self.COLORS['panel_glow']
        )
        card.pack(fill=tk.X, pady=self.SPACING['sm'])
        
        # Priority color bar on left
        priority_colors = {
            'High': self.COLORS['priority_high'],
            'Medium': self.COLORS['priority_medium'],
            'Low': self.COLORS['priority_low']
        }
        priority_color = priority_colors.get(task.priority, self.COLORS['primary'])
        
        priority_bar = ctk.CTkFrame(
            card,
            width=4,
            fg_color=priority_color,
            corner_radius=0
        )
        priority_bar.pack(side=tk.LEFT, fill=tk.Y, padx=(0, self.SPACING['sm']))
        
        # Content area
        content_frame = ctk.CTkFrame(card, fg_color="transparent")
        content_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, pady=self.SPACING['sm'])
        
        # Status indicator and title
        status_symbol = '●'
        status_color = self.COLORS['success'] if task.status == 'Completed' else self.COLORS['text_primary']
        
        title_label = ctk.CTkLabel(
            content_frame,
            text=f"{status_symbol}  {task.title}",
            font=self.FONTS['h3'],
            text_color=status_color,
            anchor='w'
        )
        title_label.pack(anchor='w', fill=tk.X)
        
        # Metadata row
        deadline_str = task.deadline if task.deadline else 'No deadline'
        metadata_text = f"Priority: {task.priority} • Deadline: {deadline_str} • ID: {task.id}"
        
        metadata_label = ctk.CTkLabel(
            content_frame,
            text=metadata_text,
            font=self.FONTS['small'],
            text_color=self.COLORS['text_tertiary'],
            anchor='w'
        )
        metadata_label.pack(anchor='w', pady=(4, 0))
        
        # Action buttons
        action_frame = ctk.CTkFrame(card, fg_color="transparent")
        action_frame.pack(side=tk.RIGHT, padx=self.SPACING['sm'], pady=self.SPACING['sm'])
        
        if task.status != 'Completed':
            complete_btn = ctk.CTkButton(
                action_frame,
                text="✓ Complete",
                command=lambda: self.complete_task(task.id),
                font=self.FONTS['small'],
                fg_color=self.COLORS['success'],
                hover_color=self._darken_color(self.COLORS['success']),
                corner_radius=6,
                width=100,
                height=32
            )
            complete_btn.pack(side=tk.LEFT, padx=(0, self.SPACING['xs']))
        
        delete_btn = ctk.CTkButton(
            action_frame,
            text="✕ Delete",
            command=lambda: self.delete_task(task.id),
            font=self.FONTS['small'],
            fg_color=self.COLORS['danger'],
            hover_color=self._darken_color(self.COLORS['danger']),
            corner_radius=6,
            width=90,
            height=32
        )
        delete_btn.pack(side=tk.LEFT)
        
        # Hover effect
        card.bind("<Enter>", lambda e: card.configure(border_color=self.COLORS['glow'], border_width=2))
        card.bind("<Leave>", lambda e: card.configure(border_color=self.COLORS['border'], border_width=1))
        
        return card
        
    def _setup_keyboard_shortcuts(self) -> None:
        """Set up keyboard shortcuts."""
        self.root.bind('<Control-r>', lambda e: self.refresh_task_list())
        self.assistant_input.bind('<Return>', lambda e: self.run_assistant())
        
    def _on_task_input_focus_in(self, event) -> None:
        """Handle task input focus in."""
        if self.task_input.get("1.0", "end-1c") == getattr(self, "_task_placeholder", ""):
            self.task_input.delete("1.0", tk.END)
            self.task_input.configure(text_color=self.COLORS['text_primary'])
        self.task_input.configure(border_color=self.COLORS['glow'])
        
    def _on_task_input_focus_out(self, event) -> None:
        """Handle task input focus out."""
        if not self.task_input.get("1.0", "end-1c").strip():
            self.task_input.insert("1.0", getattr(self, "_task_placeholder", ""))
            self.task_input.configure(text_color=self.COLORS['text_secondary'])
        self.task_input.configure(border_color=self.COLORS['border'])
        
    def _darken_color(self, hex_color: str, factor: float = 0.8) -> str:
        """Darken a color for hover effects."""
        hex_color = hex_color.lstrip('#')
        rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        rgb = tuple(int(c * factor) for c in rgb)
        return f'#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}'
        
    # Controller Methods
    
    def add_task(self) -> None:
        """Add a new task using the assistant."""
        task_text = self.task_input.get("1.0", "end-1c").strip()
        placeholder = getattr(self, "_task_placeholder", "")
        
        if not task_text or task_text == placeholder:
            self.show_notification("Please enter a task", "error")
            return
            
        try:
            # Show loading state
            self.add_task_btn.configure(state="disabled", text="Adding...")
            self.root.update()
            
            # Use assistant to parse and add task
            response = self.assistant.process_input(task_text)
            
            # Check for errors in response
            if "❌" in response or "Error" in response:
                # Extract error message
                error_msg = response.split('\n')[-1] if '\n' in response else response
                self.show_notification(error_msg, "error")
                return

            # Clear input
            self.task_input.delete("1.0", tk.END)
            self.task_input.insert("1.0", placeholder)
            self.task_input.configure(text_color=self.COLORS['text_secondary'])
            
            # Refresh list
            self.refresh_task_list()
            
            # Show success
            self.show_notification("✓ Task added successfully!", "success")
            
        except Exception as e:
            self.show_notification(f"Error: {str(e)}", "error")
        finally:
            self.add_task_btn.configure(state="normal", text="➕ Add Task")
            
    def run_assistant(self) -> None:
        """Run the AI assistant with user query."""
        query = self.assistant_input.get().strip()
        
        if not query:
            self.show_notification("Please enter a query", "error")
            return
            
        try:
            # Show loading state
            self.run_assistant_btn.configure(state="disabled", text="Processing...")
            self.root.update()
            
            # Process with assistant
            response = self.assistant.process_input(query)
            
            # Clear input
            self.assistant_input.delete(0, tk.END)
            
            # Refresh list
            self.refresh_task_list()
            
            # Show response
            self.show_notification(response[:80] + "..." if len(response) > 80 else response, "info")
            
        except Exception as e:
            self.show_notification(f"Error: {str(e)}", "error")
        finally:
            self.run_assistant_btn.configure(state="normal", text="🤖 Run Assistant")
            
    def complete_task(self, task_id: int) -> None:
        """Mark a task as completed with animation."""
        try:
            self.db.update_task(task_id, status='Completed')
            self.refresh_task_list()
            self.show_notification(f"✓ Task {task_id} completed!", "success")
        except Exception as e:
            self.show_notification(f"Error: {str(e)}", "error")
            
    def delete_task(self, task_id: int) -> None:
        """Delete a task."""
        try:
            self.db.delete_task(task_id)
            self.refresh_task_list()
            self.show_notification(f"Task {task_id} deleted", "info")
        except Exception as e:
            self.show_notification(f"Error: {str(e)}", "error")
            
    def refresh_task_list(self) -> None:
        """Refresh the task list display."""
        try:
            feed = getattr(self, "task_feed_frame", None)
            if not feed:
                return
            
            for widget in feed.winfo_children():
                widget.destroy()
                
            # Get all tasks
            tasks = self.db.get_tasks()
            
            # Update count badge
            count_text = "No tasks" if not tasks else f"{len(tasks)} tasks"
            self.task_count_label.configure(text=count_text)
            self.provider_info.configure(
                text=f"Connected to {self.selected_provider} with model "
                     f"{self.selected_model or 'default'}"
            )
            
            if not tasks:
                # Empty state
                empty_frame = ctk.CTkFrame(self.task_feed_frame, fg_color="transparent")
                empty_frame.pack(expand=True, pady=self.SPACING['xl'])
                
                empty_label = ctk.CTkLabel(
                    empty_frame,
                    text="📋 No tasks yet",
                    font=self.FONTS['h2'],
                    text_color=self.COLORS['text_tertiary']
                )
                empty_label.pack()
                
                hint_label = ctk.CTkLabel(
                    empty_frame,
                    text="Add your first task above to get started!",
                    font=self.FONTS['body'],
                    text_color=self.COLORS['text_tertiary']
                )
                hint_label.pack(pady=(self.SPACING['xs'], 0))
            else:
                # Create task cards
                for task in tasks:
                    self._create_task_card(task)
            
            completed = len([t for t in tasks if t.status == 'Completed'])
            pending = len(tasks) - completed
            insight_text = f"{pending} pending • {completed} completed"
            if pending:
                high_priority = len([t for t in tasks if t.priority == 'High' and t.status != 'Completed'])
                if high_priority:
                    insight_text += f" • {high_priority} high priority"
            self.insights_label.configure(text=f"TaskJarvis overview:\n{insight_text}")
                    
        except Exception as e:
            self.show_notification(f"Error refreshing tasks: {str(e)}", "error")
            
    def show_analytics(self) -> None:
        """Open modern analytics window."""
        try:
            tasks = self.db.get_tasks()
            
            if not tasks:
                self.show_notification("No tasks to analyze", "warning")
                return
                
            # Create modern toplevel window
            analytics_window = ctk.CTkToplevel(self.root)
            analytics_window.title("TaskJarvis Analytics")
            analytics_window.geometry("750x650")
            analytics_window.configure(fg_color=self.COLORS['bg_primary'])
            
            # Header
            header = ctk.CTkLabel(
                analytics_window,
                text="📊 Productivity Analytics",
                font=self.FONTS['h1'],
                text_color=self.COLORS['text_primary']
            )
            header.pack(pady=self.SPACING['md'])
            
            # Stats card
            stats_frame = ctk.CTkFrame(
                analytics_window,
                fg_color=self.COLORS['bg_secondary'],
                corner_radius=12
            )
            stats_frame.pack(fill=tk.X, padx=self.SPACING['md'], pady=(0, self.SPACING['md']))
            
            stats = self.dashboard.get_stats(tasks)
            stats_label = ctk.CTkLabel(
                stats_frame,
                text=stats,
                font=self.FONTS['mono'],
                text_color=self.COLORS['text_primary'],
                justify=tk.LEFT
            )
            stats_label.pack(padx=self.SPACING['md'], pady=self.SPACING['md'])
            
            # Chart
            chart_frame = ctk.CTkFrame(analytics_window, fg_color=self.COLORS['bg_secondary'], corner_radius=12)
            chart_frame.pack(fill=tk.BOTH, expand=True, padx=self.SPACING['md'], pady=(0, self.SPACING['md']))
            
            fig, ax = plt.subplots(figsize=(7, 4), facecolor=self.COLORS['bg_secondary'])
            
            statuses = [t.status for t in tasks]
            status_counts = {s: statuses.count(s) for s in set(statuses)}
            
            colors = [self.COLORS['success'] if s == 'Completed' else self.COLORS['primary'] 
                     for s in status_counts.keys()]
            
            ax.pie(
                status_counts.values(),
                labels=status_counts.keys(),
                autopct='%1.1f%%',
                startangle=140,
                colors=colors,
                textprops={'color': self.COLORS['text_primary'], 'fontsize': 12, 'weight': 'bold'}
            )
            ax.set_facecolor(self.COLORS['bg_secondary'])
            
            canvas = FigureCanvasTkAgg(fig, chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True, padx=self.SPACING['sm'], pady=self.SPACING['sm'])
            
            # Close button
            close_btn = ctk.CTkButton(
                analytics_window,
                text="Close",
                command=analytics_window.destroy,
                font=self.FONTS['body_bold'],
                fg_color=self.COLORS['bg_tertiary'],
                hover_color=self.COLORS['hover'],
                corner_radius=8,
                height=40,
                width=120
            )
            close_btn.pack(pady=self.SPACING['md'])
            
        except Exception as e:
            self.show_notification(f"Error: {str(e)}", "error")
            
    def show_notification(self, message: str, msg_type: str = "info") -> None:
        """
        Show a modern toast notification.
        
        Args:
            message: Notification message
            msg_type: Type (success, error, warning, info)
        """
        # Cancel previous timer
        if self.notification_timer:
            self.root.after_cancel(self.notification_timer)
            
        # Color based on type
        colors = {
            'success': self.COLORS['success'],
            'error': self.COLORS['danger'],
            'warning': self.COLORS['warning'],
            'info': self.COLORS['primary']
        }
        bg_color = colors.get(msg_type, self.COLORS['primary'])
        
        # Configure notification
        self.notification_frame.configure(fg_color=bg_color, height=60, width=400)
        
        # Position at top-right
        self.notification_frame.place(
            relx=0.98,
            rely=0.02,
            anchor="ne"
        )
        
        # Clear previous content
        for widget in self.notification_frame.winfo_children():
            widget.destroy()
            
        # Add message
        notif_label = ctk.CTkLabel(
            self.notification_frame,
            text=message,
            font=self.FONTS['body'],
            text_color=self.COLORS['text_primary'],
            wraplength=360
        )
        notif_label.pack(pady=self.SPACING['sm'], padx=self.SPACING['sm'])
        
        # Auto-hide after 3 seconds
        self.notification_timer = self.root.after(3000, self._hide_notification)
        
    def _hide_notification(self) -> None:
        """Hide the notification."""
        self.notification_frame.place_forget()
        self.notification_timer = None


class Tooltip:
    """Modern tooltip implementation for CustomTkinter widgets."""
    def __init__(self, widget, text, delay=500):
        self.widget = widget
        self.text = text
        self.delay = delay
        self.tooltip_window = None
        self.id = None
        self.x = self.y = 0
        
        self.widget.bind("<Enter>", self.schedule, add="+")
        self.widget.bind("<Leave>", self.hide, add="+")
        self.widget.bind("<ButtonPress>", self.hide, add="+")

    def schedule(self, event=None):
        self.hide()
        self.id = self.widget.after(self.delay, self.show)

    def show(self):
        if self.tooltip_window:
            return
            
        # Calculate position
        x = self.widget.winfo_rootx() + 20
        y = self.widget.winfo_rooty() + self.widget.winfo_height() + 5
        
        self.tooltip_window = tk.Toplevel(self.widget)
        self.tooltip_window.wm_overrideredirect(True)
        self.tooltip_window.wm_geometry(f"+{x}+{y}")
        
        # Modern styling
        label = tk.Label(
            self.tooltip_window,
            text=self.text,
            justify='left',
            background="#1e293b",  # Dark blue-grey
            foreground="#f8fafc",  # White text
            relief='flat',
            borderwidth=0,
            font=("Segoe UI", 10),
            padx=8,
            pady=4
        )
        label.pack()
        
        # Add subtle border
        frame = tk.Frame(
            self.tooltip_window,
            background="#334155",  # Lighter border
            padx=1,
            pady=1
        )
        label.lift()
        label.pack(in_=frame)
        frame.pack()

    def hide(self, event=None):
        if self.id:
            self.widget.after_cancel(self.id)
            self.id = None
        if self.tooltip_window:
            self.tooltip_window.destroy()
            self.tooltip_window = None

def main():
    """Main entry point for the modern GUI application."""
    root = ctk.CTk()
    app = ModernTaskJarvisGUI(root)
    
    # Add tooltips to sidebar
    Tooltip(app.refresh_btn, "Refresh task list")
    
    # Add tooltips to inputs
    Tooltip(app.task_input, "Type your task here")
    Tooltip(app.assistant_input, "Ask AI to help organize or find tasks")
    
    # Add tooltips to action buttons
    Tooltip(app.add_task_btn, "Create new task")
    Tooltip(app.run_assistant_btn, "Send query to AI Assistant")
    Tooltip(app.analytics_btn, "View productivity insights")
    
    root.mainloop()

if __name__ == "__main__":
    main()
