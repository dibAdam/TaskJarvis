# TaskJarvis

**AI-powered personal productivity assistant with multi-LLM provider support**

TaskJarvis is a modular, extensible productivity assistant that uses AI to understand natural language commands and manage your tasks intelligently. Choose from 5 different LLM providers or run completely offline.

## ✨ Features

- 🤖 **Multi-LLM Provider Support**: OpenAI, Anthropic, Google Gemini, Ollama (local), HuggingFace, or Mock
- 🗣️ **Natural Language Understanding**: Speak naturally - "Remind me to call Mom tomorrow at 5pm"
- ✅ **Smart Task Management**: Add, list, complete, and delete tasks with SQLite storage
- 📊 **Productivity Analytics**: Track completion rates and visualize task distribution
- 🔔 **Desktop Notifications**: Get notified about task additions and completions
- 🏗️ **Extensible Architecture**: Clean factory pattern, easy to add new providers
- 🧪 **Fully Tested**: Comprehensive test suite with 8/8 passing tests

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Configure Your LLM Provider

Create a `.env` file:

```bash
# Choose your provider
LLM_PROVIDER=OPENAI  # or ANTHROPIC, GEMINI, OLLAMA, HUGGINGFACE, MOCK

# Add your API key (only for cloud providers)
OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
# GEMINI_API_KEY=your_key_here
# HUGGINGFACE_API_KEY=your_key_here

# For Ollama (local)
# OLLAMA_HOST=http://localhost:11434
```

**No API key?** No problem! TaskJarvis automatically falls back to Mock mode.

### 3. Run

```bash
python main.py
```

## 💬 Usage Examples

```
> Add a high priority task to finish the report by Friday
I've added that task for you.
(Task ID: 1)

> Show my tasks
Here are your tasks.
--------------------
Task #1: finish the report
  Priority: High
  Status: Pending
  Deadline: 2025-11-29 00:00:00

> Complete task 1
Task 1 marked as completed.

> How am I doing?
--- Productivity Analytics ---
Total Tasks: 1
Completed: 1
Pending: 0
Completion Rate: 100.0%
```

## 🎯 Supported LLM Providers

| Provider | Type | API Key | Best For |
|----------|------|---------|----------|
| **OpenAI** | Cloud | Required | GPT-4, GPT-3.5 |
| **Anthropic** | Cloud | Required | Claude 3.5 Sonnet |
| **Google Gemini** | Cloud | Required | Gemini Pro |
| **Ollama** | Local | Not needed | Privacy, offline |
| **HuggingFace** | Cloud | Required | Open-source models |
| **Mock** | Local | Not needed | Testing, development |

### Switching Providers

Just change `LLM_PROVIDER` in your `.env` file and restart:

```bash
LLM_PROVIDER=ANTHROPIC  # Switch to Claude
LLM_PROVIDER=OLLAMA     # Switch to local
LLM_PROVIDER=MOCK       # No API needed
```

## 📁 Project Structure

```
taskjarvis/
├── main.py                    # Entry point
├── assistant/
│   ├── llm/                   # Multi-provider LLM module
│   │   ├── base_llm.py       # Abstract base class
│   │   ├── errors.py         # Custom exceptions
│   │   ├── openai_llm.py     # OpenAI implementation
│   │   ├── anthropic_llm.py  # Anthropic implementation
│   │   ├── gemini_llm.py     # Google Gemini
│   │   ├── ollama_llm.py     # Local Ollama
│   │   ├── huggingface_llm.py# HuggingFace
│   │   ├── mock_llm.py       # Mock for testing
│   │   └── factory.py        # Factory pattern
│   └── assistant.py          # Task routing logic
├── tasks/                     # Task management
│   ├── task.py               # Task model
│   └── task_db.py            # SQLite database
├── nlp/                       # Legacy NLP parser
├── notifications/             # Desktop notifications
├── analytics/                 # Productivity dashboard
├── config/                    # Configuration
│   └── settings.py           # Multi-provider settings
└── tests/                     # Unit tests (8/8 passing)
```

## 🧪 Testing

```bash
python -m pytest tests/ -v
```

Expected output:
```
8 passed in 1.32s
```

## 🔧 Advanced Configuration

### Custom Models

Override default models in `.env`:

```bash
OPENAI_MODEL=gpt-4o
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
GEMINI_MODEL=gemini-pro
OLLAMA_MODEL=llama2
HUGGINGFACE_MODEL=meta-llama/Llama-2-7b-chat-hf
```

### Ollama Setup (Local)

1. Install Ollama: https://ollama.ai/
2. Pull a model: `ollama pull llama2`
3. Start server: `ollama serve`
4. Set `LLM_PROVIDER=OLLAMA`

## 🏗️ Architecture Highlights

### Factory Pattern
Clean separation between provider selection and business logic:

```python
from assistant.llm.factory import LLMFactory

client = LLMFactory.create_with_fallback(
    provider="OPENAI",
    api_key="your_key"
)
```

### Custom Exceptions
Unified error handling across all providers:

```python
from assistant.llm.errors import (
    LLMError,
    LLMRateLimitError,
    LLMAuthError,
    LLMConnectionError
)
```

### Extensible Design
Add new providers by implementing `BaseLLMClient`:

```python
class YourProviderLLMClient(BaseLLMClient):
    def generate(self, prompt: str) -> str:
        # Your implementation
        pass
```

## 📚 Documentation

- **Setup Guide**: See [walkthrough.md](walkthrough.md)
- **Architecture**: Factory pattern with 5 provider implementations
- **Design Principles**: SOLID, separation of concerns, dependency injection

## 🤝 Contributing

To add a new LLM provider:

1. Create `assistant/llm/your_provider_llm.py` extending `BaseLLMClient`
2. Add to `factory.py`
3. Update `config/settings.py`
4. Add tests

## 📄 License

MIT License - feel free to use and modify!

## 🎉 Credits

Built with Python, spaCy, and multiple LLM SDKs (OpenAI, Anthropic, Google, Ollama, HuggingFace).

---

**Ready to boost your productivity?** `python main.py` 🚀
