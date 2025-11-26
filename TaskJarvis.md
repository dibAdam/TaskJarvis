# TaskJarvis - AI-Powered Personal Productivity Assistant

## What TaskJarvis Is About

TaskJarvis is a modular, AI-powered personal productivity assistant built in Python. Its purpose is to let the user manage tasks using natural language — just like talking to Jarvis from Iron Man.

Instead of commands like `add_task("Buy milk")`, the user can speak or type:

> "Add a task to buy milk tomorrow morning"

and TaskJarvis understands it, parses it, saves it, and responds.

**TaskJarvis is not just a task manager** — it's a smart assistant that does NLP, analytics, notifications, and soon has a full GUI.

---

## Core Functionalities

Here are the essential pillars of the system — the non-negotiables that define the project.

### ⭐ 1. Smart Task Management

TaskJarvis should allow the user to:

#### ✔ Add tasks

Using natural language:
- "Add task buy groceries tomorrow"
- "Remind me to call Mom at 8pm"

**Entities:**
- Task title
- Deadline (datetime or relative)
- Priority (Low, Medium, High)

#### ✔ List tasks

With flexible filters:
- "List all tasks"
- "What do I need to do today?"
- "Show completed tasks"
- "Show tasks for tomorrow"
- "Tasks due this week"

#### ✔ Complete tasks

- "Complete task 3"
- "Mark the grocery task as done"

#### ✔ Delete tasks

Single or bulk:
- "Delete task 5"
- "Delete today's tasks"
- "Delete all tasks for this week"
- "Clear everything"

**These 4 operations are the foundation.**

---

### ⭐ 2. Natural Language Understanding (AI Assistant Layer)

TaskJarvis needs to interpret natural language into:
- **intent** (add_task, list_tasks, etc.)
- **entities** (title, deadline, priority, ID, relative period, date range)

**Examples:**
- "I wanna see what I need to do" → `list_tasks (Pending)`
- "Show me tasks due tomorrow morning" → `list_tasks (relative_period=tomorrow)`
- "Remove all tasks for this week" → `delete_task (relative_period=this_week)`

**THIS is what makes it Jarvis-like.**

---

### ⭐ 3. Date & Time Understanding

TaskJarvis must properly understand:

**Absolute dates:**
- "on January 5"
- "2024-12-01"

**Relative dates:**
- today
- tomorrow
- this week
- in 2 hours
- next Monday
- next 3 days

This is crucial because most natural language commands include time.

---

### ⭐ 4. AI Routing → Internal Functions

After the AI understands the intent, TaskJarvis must route it to the right internal method:

```
assistant detects → tasks module executes
```

Clean, predictable, testable.

---

### ⭐ 5. Analytics & Statistics

TaskJarvis should show productivity insights:
- tasks completed today
- pending tasks
- completion rate
- best days
- charts/graphs

---

### ⭐ 6. Logging

For debugging:
- User input
- Parsed intents
- Assistant decisions
- Time parsing
- Actions taken

Logs must help diagnose problems.

---

### ⭐ 7. GUI (Graphical Interface)

A complete desktop UI:
- Dark futuristic design
- Input box (assistant)
- Task list panel
- Buttons for quick actions
- Chart viewer
- Integrated notifications
- Minimal CLI usage

---

### ⭐ 8. Modular, Maintainable Architecture

**Folder structure:**
```
main.py
assistant/
tasks/
nlp/
analytics/
notifications/
ui/
config/
tests/
```

Easy to extend, readable, reusable code.

---

## Summary — What MUST Be There

| Category | Required Features |
|----------|------------------|
| **Task Management** | Add, list, delete, complete |
| **Date Parsing** | Relative + absolute dates |
| **Natural Language** | AI Intent + entity extraction |
| **Bulk Actions** | Delete/list tasks by range or period |
| **Analytics** | Stats + charts |
| **GUI** | Full dark modern interface |
| **Logging** | Every AI request + result + errors |
| **Clean Code** | Modular, documented, testable |

**This is the identity of TaskJarvis.**