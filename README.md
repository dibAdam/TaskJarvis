# TaskJarvis

<div align="center">

**The Next-Generation AI Productivity Assistant**

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Code Style](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![UI Framework](https://img.shields.io/badge/UI-CustomTkinter-blueviolet)](https://github.com/TomSchimansky/CustomTkinter)

</div>

---

## 📖 Overview

**TaskJarvis** is a sophisticated, AI-driven productivity suite designed to bridge the gap between natural language intent and structured task management. Unlike traditional to-do lists, TaskJarvis understands context, priority, and nuance, allowing users to manage their workload through natural conversation.

Built with a **modern, glassmorphic interface** and powered by a **multi-provider LLM architecture**, it offers a premium desktop experience that integrates seamlessly with your workflow. Whether you prefer cloud-based intelligence (OpenAI, Gemini, Anthropic) or local privacy (Ollama), TaskJarvis adapts to your needs.

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
- **GUI Framework**: **CustomTkinter** (Modern wrapper for Tkinter)
- **Database**: **SQLite** (Serverless, zero-configuration storage)
- **NLP**: **SpaCy** (Entity recognition fallback) & **LLMs** (Semantic understanding)

### AI & Intelligence
- **Google Gemini API**: High-speed, multimodal reasoning.
- **OpenAI API**: Advanced reasoning and instruction following.
- **Anthropic Claude**: Natural, nuanced conversation.
- **Ollama**: Local, privacy-focused model execution (Llama 2, Mistral).
- **HuggingFace**: Access to open-source models.

### Analytics & Visualization
- **Matplotlib**: Real-time rendering of productivity charts and distribution graphs embedded directly in the UI.

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
- (Optional) API Keys for cloud providers

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
   ```env
   # Cloud Providers (Optional)
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=AIza...
   ANTHROPIC_API_KEY=sk-ant...
   
   # Local Setup
   OLLAMA_HOST=http://localhost:11434
   ```

4. **Launch**
   ```bash
   python ui/app.py
   ```

---

## 📘 User Guide

### 1. Provider Selection
Upon startup, you will be presented with a configuration dialog.
- **Cloud Models**: Select OpenAI, Gemini, or Anthropic for best performance.
- **Local/Offline**: Select **Ollama** or **Mock** to run without internet or API keys.

### 2. The Dashboard
The main interface is divided into three zones:
- **Sidebar**: Navigation and quick actions.
- **Task Feed**: Central view of your active tasks.
- **Composer**: Bottom input area for adding tasks or chatting.

### 3. Natural Language Commands
TaskJarvis understands intent. Try these commands in the **Ask** or **Task** input:

| Intent | Example Command |
|:-------|:----------------|
| **Add Task** | "Remind me to submit the report by Friday at 5pm, high priority." |
| **Query** | "Show me all my high priority tasks pending for this week." |
| **Modify** | "Mark the grocery task as completed." |
| **Delete** | "Delete task #4." |
| **Analysis** | "How is my productivity looking today?" |

### 4. Analytics
Click the **Insights** (📊) button to open the analytics modal.
- **Completion Rate**: Visual pie chart of Pending vs. Completed tasks.
- **Priority Breakdown**: See distribution of High/Medium/Low priority tasks.

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
