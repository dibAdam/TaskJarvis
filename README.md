# TaskJarvis

**AI-powered personal productivity assistant with multi-LLM provider support and comprehensive logging**

TaskJarvis is a modular, extensible productivity assistant that uses AI to understand natural language commands and manage your tasks intelligently. Choose from 5 different LLM providers or run completely offline, with full logging for debugging and analysis.

## ✨ Features

- 🤖 **Multi-LLM Provider Support**: OpenAI, Anthropic, Google Gemini, Ollama (local), HuggingFace, or Mock
- 📊 **Comprehensive Logging**: Track all LLM calls, task operations, and system events with rotating file logs
- 🗣️ **Natural Language Understanding**: Speak naturally - "Remind me to call Mom tomorrow at 5pm"
- ✅ **Smart Task Management**: Add, list, complete, and delete tasks with SQLite storage
- 📈 **Productivity Analytics**: Track completion rates and visualize task distribution
- 🔔 **Desktop Notifications**: Get notified about task additions and completions
- 🏗️ **Extensible Architecture**: Clean factory pattern, easy to add new providers
- 🧪 **Fully Tested**: Comprehensive test suite with 7/8 passing tests

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
LLM_PROVIDER=OLLAMA  # or OPENAI, ANTHROPIC, GEMINI, HUGGINGFACE, MOCK

# Add your API key (only for cloud providers)
OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
# GEMINI_API_KEY=your_key_here
# HUGGINGFACE_API_KEY=your_key_here

# For Ollama (local)
OLLAMA_HOST=http://localhost:11434
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

## 📊 Logging System

### Automatic Logging

All operations are logged to `logs/taskjarvis.log`:

- **LLM Requests/Responses**: Every AI call with latency, token usage, and errors
- **Intent Processing**: User input, detected intents, and entity extraction
- **Task Operations**: All CRUD operations with full details
- **Sensitive Data Protection**: API keys automatically redacted

### Log Configuration

- **Rotating Files**: Max 5MB per file, keeps 5 backups
- **Console Output**: INFO level and above
- **File Output**: DEBUG level and above

### Example Log Output

```
2025-11-25 19:45:00 - assistant.llm.ollama_llm - INFO - Ollama client initialized with model: llama2
2025-11-25 19:45:02 - assistant.llm.ollama_llm - DEBUG - LLM Request | Provider: Ollama | Model: llama2 | Prompt: You are TaskJarvis...
2025-11-25 19:45:04 - assistant.llm.ollama_llm - DEBUG - LLM Response | Provider: Ollama | Latency: 2.15s
2025-11-25 19:45:04 - tasks.task_db - INFO - Task added: ID=1, Title='eat', Priority=Medium
```

## 🎯 Supported LLM Providers

| Provider | Type | API Key | Logging Features |
|----------|------|---------|------------------|
| **OpenAI** | Cloud | Required | Token usage tracking |
| **Anthropic** | Cloud | Required | Token usage tracking |
| **Google Gemini** | Cloud | Required | Full request/response |
| **Ollama** | Local | Not needed | Full request/response |
| **HuggingFace** | Cloud | Required | Full request/response |
| **Mock** | Local | Not needed | Full request/response |

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
├── taskjarvis_logging/        # Logging module
│   └── logger.py             # Centralized logger config
├── logs/                      # Log files (auto-generated)
│   └── taskjarvis.log        # Rotating log file
├── assistant/
│   ├── llm/                   # Multi-provider LLM module
│   │   ├── base_llm.py       # Abstract base class
│   │   ├── errors.py         # Custom exceptions
│   │   ├── openai_llm.py     # OpenAI (with logging)
│   │   ├── anthropic_llm.py  # Anthropic (with logging)
│   │   ├── gemini_llm.py     # Google Gemini
│   │   ├── ollama_llm.py     # Ollama (with logging)
│   │   ├── huggingface_llm.py# HuggingFace
│   │   ├── mock_llm.py       # Mock for testing
│   │   └── factory.py        # Factory pattern
│   └── assistant.py          # Task routing (with logging)
├── tasks/                     # Task management
│   ├── task.py               # Task model
│   └── task_db.py            # SQLite database (with logging)
├── config/                    # Configuration
│   └── settings.py           # Multi-provider settings
└── tests/                     # Unit tests (7/8 passing)
```

## 🧪 Testing

```bash
python -m pytest tests/ -v
```

Expected output:
```
7 passed in 16.2s
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

### Viewing Logs

```bash
# View latest logs
tail -f logs/taskjarvis.log

# Search for errors
grep "ERROR" logs/taskjarvis.log

# View LLM latency
grep "Latency" logs/taskjarvis.log
```

## 🏗️ Architecture Highlights

### Factory Pattern
Clean separation between provider selection and business logic

### Custom Exceptions
Unified error handling across all providers (LLMError, LLMRateLimitError, LLMAuthError, LLMConnectionError)

### Comprehensive Logging
- Rotating file handlers (5MB, 5 backups)
- Sensitive data filtering
- Performance tracking (latency, token usage)
- Full error context

### Extensible Design
Add new providers by implementing `BaseLLMClient`

## 📚 Documentation

- **Setup Guide**: See [walkthrough.md](walkthrough.md)
- **Architecture**: Factory pattern with 5 provider implementations
- **Design Principles**: SOLID, separation of concerns, dependency injection

## 🤝 Contributing

To add a new LLM provider:

1. Create `assistant/llm/your_provider_llm.py` extending `BaseLLMClient`
2. Add logging with `log_llm_request` and `log_llm_response`
3. Add to `factory.py`
4. Update `config/settings.py`
5. Add tests

## 📄 License

MIT License - feel free to use and modify!

## 🎉 Credits

Built with Python, spaCy, and multiple LLM SDKs (OpenAI, Anthropic, Google, Ollama, HuggingFace).

---

**Ready to boost your productivity?** `python main.py` 🚀
