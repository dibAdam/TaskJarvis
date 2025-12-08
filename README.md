# TaskJarvis

<div align="center">

**The Next-Generation AI Productivity Assistant**

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Code Style](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![UI Framework](https://img.shields.io/badge/UI-CustomTkinter-blueviolet)](https://github.com/TomSchimansky/CustomTkinter)
[![Web UI](https://img.shields.io/badge/Web%20UI-Next.js-black)](https://nextjs.org/)

</div>

---

## 📖 Overview

**TaskJarvis** is a sophisticated, AI-driven productivity suite designed to bridge the gap between natural language intent and structured task management. Unlike traditional to-do lists, TaskJarvis understands context, priority, and nuance, allowing users to manage their workload through natural conversation.

Built with a **modern, glassmorphic interface** and powered by **OpenRouter's unified AI platform**, it offers both a premium desktop experience and a modern web interface. Access 100+ AI models through a single API - from Claude and GPT-4 to open-source alternatives.

---

## 🏗️ Architecture & Design Patterns

TaskJarvis is engineered with scalability and maintainability at its core, utilizing industry-standard software design patterns.

### 1. Factory Pattern (LLM Instantiation)
The system employs a robust **Factory Pattern** (`LLMFactory`) to decouple the client application from specific LLM implementations. This allows for:
- **Dynamic Provider Switching**: Seamlessly toggle between OpenAI, Gemini, and Local models at runtime.
- **Extensibility**: New providers can be added by simply extending the `BaseLLMClient` abstract base class without modifying core logic.

### 2. Strategy Pattern (AI Execution)
Each AI provider implements a common interface defined by `BaseLLMClient`. The application uses these interchangeable strategies for text generation, ensuring consistent behavior regardless of the underlying intelligence model.

### 3. Model-View-Controller (MVC) Adaptation
- **Model**: `TaskDB` (SQLite) and `Task` data classes manage state and persistence.
- **View**: `ModernTaskJarvisGUI` (CustomTkinter) handles presentation, animations, and user feedback.
- **Controller**: `TaskAssistant` acts as the intelligent mediator, processing natural language input into structured database commands.

### 4. Dependency Injection
Core components like `TaskDB` are injected into dependent services (`TaskAssistant`, `Dashboard`), promoting loose coupling and making the system highly testable.

---

## 💻 Technology Stack

### Core Frameworks
- **Language**: Python 3.10+
- **Desktop UI**: **CustomTkinter** (Modern wrapper for Tkinter)
- **Web UI**: **Next.js 16** with React 19 and TypeScript
- **API**: **FastAPI** (High-performance REST API)
- **Database**: **SQLite** (Local mode) / **PostgreSQL** (Cloud mode)
- **ORM**: **SQLAlchemy 2.0** with Alembic migrations
- **NLP**: **SpaCy** (Entity recognition fallback) & **LLMs** (Semantic understanding)

### AI & Intelligence
- **OpenRouter**: Unified access to 100+ AI models through a single API
  - Anthropic Claude (best for structured output, SQL generation)
  - OpenAI GPT-4/GPT-4o (advanced reasoning)
  - Meta Llama (open-source, privacy-focused)
  - And many more models with automatic cost optimization

### Multi-User Cloud Features (v2.0)
- **Authentication**: JWT-based authentication with refresh tokens
- **Security**: bcrypt password hashing, secure token management
- **Real-Time Sync**: WebSocket connections for instant updates
- **Collaboration**: Shared workspaces with role-based access control
- **Scalability**: PostgreSQL support for production deployments

### Analytics & Visualization
- **Matplotlib**: Real-time rendering of productivity charts and distribution graphs embedded directly in the UI.

---

## ✨ Features

### Core Features
- **Natural Language Processing**: Create, update, and manage tasks using conversational language
- **AI-Powered Assistant**: Multiple LLM providers for intelligent task management
- **Smart Analytics**: Productivity insights and task distribution visualization
- **Modern UI**: Glassmorphic design with smooth animations and micro-interactions

### Multi-User Features (v2.0)
- **User Authentication**: Secure registration and login with JWT tokens
- **Workspaces**: Create shared workspaces for team collaboration
- **Task Assignment**: Assign tasks to team members
- **Real-Time Sync**: Instant updates across all devices via WebSocket
- **Invitation System**: Invite team members via secure tokens
- **Role-Based Access**: Owner, Admin, and Member roles with appropriate permissions
- **Dual Mode**: Seamlessly switch between local (single-user) and cloud (multi-user) modes

---

## 🎨 UI/UX Design System

TaskJarvis features a bespoke **"Deep Space"** design language, inspired by modern developer tools like Linear and VS Code.

### Visual Identity
- **Glassmorphism**: Translucent panels with background blur effects create depth and hierarchy.
- **Color Palette**: A sophisticated blend of deep charcoal backgrounds (`#0f0f0f`) and vibrant gradients (Cyan to Indigo) for accents.
- **Typography**: Uses a clean, sans-serif type scale (Segoe UI/Inter) for maximum readability.

### User Experience
- **Micro-Interactions**: Buttons ripple on click, cards lift on hover, and inputs glow on focus.
- **Smart Tooltips**: Context-aware hover descriptions guide users through the interface.
- **Responsive Layout**: A flexible grid system that adapts to window resizing, maintaining usability.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- (Optional) PostgreSQL for cloud mode
- (Optional) API Keys for cloud LLM providers

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/taskjarvis.git
   cd taskjarvis
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

3. **Configuration**
   Create a `.env` file in the root directory:
   
   **For Local Mode (Single-User)**:
   ```env
   # App Mode (local or cloud)
   APP_MODE=local
   
   # LLM Provider (optional)
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=AIza...
   ANTHROPIC_API_KEY=sk-ant...
   
   # Local Setup
   OLLAMA_HOST=http://localhost:11434
   ```
   
   **For Cloud Mode (Multi-User)**:
   ```env
   # App Mode
   APP_MODE=cloud
   
   # PostgreSQL Database
   DATABASE_URL=postgresql://user:password@localhost:5432/taskjarvis
   
   # JWT Secret (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
   JWT_SECRET_KEY=your-very-secure-secret-key-here
   
   # LLM Provider (optional)
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=AIza...
   ```

4. **Database Setup (Cloud Mode Only)**
   ```bash
   # Initialize Alembic migrations
   alembic revision --autogenerate -m "Initial schema"
   
   # Apply migrations
   alembic upgrade head
   ```

5. **Launch the API Server**
   ```bash
   # For local mode (uses api/main.py)
   uvicorn api.main:app --reload
   
   # For cloud mode (uses backend/main.py)
   uvicorn backend.main:app --reload
   ```

6. **Launch the Web UI** (Optional)
   ```bash
   cd web-ui
   npm install
   npm run dev
   ```
   Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Documentation

- **[API Documentation](API_DOCUMENTATION.md)**: Complete API reference with examples
- **[Migration Guide](MIGRATION_GUIDE.md)**: Upgrade from local to cloud mode
- **[Implementation Plan](implementation_plan.md)**: Technical architecture details

---

## 📘 User Guide

### Local Mode (Single-User)

In local mode, TaskJarvis works as a personal task manager with no authentication required.

#### Natural Language Commands
TaskJarvis understands intent. Try these commands in the **Ask** or **Task** input:

| Intent | Example Command |
|:-------|:----------------|
| **Add Task** | "Remind me to submit the report by Friday at 5pm, high priority." |
| **Query** | "Show me all my high priority tasks pending for this week." |
| **Modify** | "Mark the grocery task as completed." |
| **Delete** | "Delete task #4." |
| **Analysis** | "How is my productivity looking today?" |

#### Analytics
Click the **Insights** (📊) button to open the analytics modal.
- **Completion Rate**: Visual pie chart of Pending vs. Completed tasks.
- **Priority Breakdown**: See distribution of High/Medium/Low priority tasks.

### Cloud Mode (Multi-User)

In cloud mode, TaskJarvis enables team collaboration with authentication and workspaces.

#### 1. Authentication

**Register**:
```bash
POST /auth/register
{
  "email": "you@example.com",
  "username": "yourusername",
  "password": "securepassword"
}
```

**Login**:
```bash
POST /auth/login
{
  "email_or_username": "yourusername",
  "password": "securepassword"
}
```

Save the returned `access_token` and `refresh_token`.

#### 2. Workspaces

**Create a Workspace**:
```bash
POST /workspaces/
Authorization: Bearer YOUR_ACCESS_TOKEN
{
  "name": "My Team",
  "description": "Team workspace"
}
```

**Invite Members**:
```bash
POST /workspaces/{workspace_id}/invite
Authorization: Bearer YOUR_ACCESS_TOKEN
{
  "email": "teammate@example.com"
}
```

Share the returned invitation token with your teammate.

**Join a Workspace**:
```bash
POST /workspaces/join/{invitation_token}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 3. Task Management

**Create Task in Workspace**:
```bash
POST /tasks/
Authorization: Bearer YOUR_ACCESS_TOKEN
{
  "title": "Complete project",
  "workspace_id": 1,
  "assigned_to_id": 2
}
```

**Real-Time Sync**:
Connect to WebSocket for instant updates:
```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/1?token=${accessToken}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle task_created, task_updated, task_deleted events
};
```

---

## 🤝 Contributing

We welcome contributions from the community!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️‍🔥 by Adam Dib</sub>
</div>
