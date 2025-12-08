# OpenRouter Migration Guide

## Overview

TaskJarvis has been migrated from a multi-provider AI architecture to a unified **OpenRouter SDK** implementation. This migration simplifies the codebase, reduces dependencies, and provides access to 100+ AI models through a single API.

---

## What Changed

### Removed
- ❌ **Ollama** (local model support)
- ❌ **HuggingFace** direct integration
- ❌ **Direct OpenAI SDK** calls
- ❌ **Direct Anthropic SDK** calls
- ❌ **Direct Google Gemini SDK** calls
- ❌ Dependencies: `anthropic`, `google-generativeai`, `huggingface_hub`

### Added
- ✅ **OpenRouter** unified client (`openrouter_llm.py`)
- ✅ Production-grade retry logic with exponential backoff
- ✅ Comprehensive error handling and rate limiting
- ✅ Access to 100+ models through one API
- ✅ Simplified configuration

---

## Getting Started

### 1. Get an OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to **Keys** section
4. Create a new API key
5. Copy your key

### 2. Update Environment Variables

Update your `.env` file:

```bash
# Required
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional - choose your model (default: anthropic/claude-3.5-sonnet)
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Provider setting (default: OPENROUTER)
LLM_PROVIDER=OPENROUTER
```

### 3. Install Updated Dependencies

```bash
pip install -r requirements.txt
```

This will install the updated `openai` package (used for OpenRouter compatibility) and remove legacy dependencies.

### 4. Restart Your Application

```bash
# Backend
uvicorn api.main:app --reload

# Frontend
cd web-ui
npm run dev
```

---

## Recommended Models

Choose a model based on your needs:

| Use Case | Model | Why |
|----------|-------|-----|
| **Default (Best Overall)** | `anthropic/claude-3.5-sonnet` | Excellent for SQL generation, structured output, reliable |
| **Fast & Cheap** | `openai/gpt-4o-mini` | Quick responses, cost-effective, good quality |
| **Advanced Reasoning** | `openai/gpt-4o` | Best for complex logic, edge cases |
| **Budget-Friendly** | `meta-llama/llama-3.1-8b-instruct` | Very cheap, open source |
| **Privacy-Focused** | `meta-llama/llama-3.1-70b-instruct` | Open source, strong performance |

### How to Change Models

**Via Environment Variable:**
```bash
OPENROUTER_MODEL=openai/gpt-4o-mini
```

**Via Web UI:**
1. Navigate to Settings
2. Select "OpenRouter (Unified AI)" as provider
3. Choose your model from the dropdown

**Via Command Line:**
```bash
python main.py --provider OPENROUTER --model openai/gpt-4o-mini
```

---

## Migration Benefits

### Before (Multi-Provider)
- 5 separate LLM client implementations
- 5 different SDK dependencies
- Complex provider-specific logic
- Inconsistent error handling
- Local infrastructure needed (Ollama)

### After (OpenRouter)
- 1 unified client implementation
- 1 dependency (`openai` for compatibility)
- Simple, consistent interface
- Production-grade error handling
- Cloud-based, no local setup

---

## Cost Comparison

OpenRouter provides transparent pricing and automatic routing to the cheapest provider:

| Model | Cost per 1M tokens (input) | Cost per 1M tokens (output) |
|-------|---------------------------|----------------------------|
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| GPT-4o | $2.50 | $10.00 |
| GPT-4o Mini | $0.15 | $0.60 |
| Llama 3.1 70B | $0.35 | $0.40 |
| Llama 3.1 8B | $0.06 | $0.06 |

**Typical TaskJarvis Usage:**
- Average request: ~500 input tokens, ~200 output tokens
- Cost per request (Claude 3.5): ~$0.0045
- Cost per request (GPT-4o Mini): ~$0.0002

---

## Troubleshooting

### Error: "OpenRouter API key is required"

**Solution:** Set `OPENROUTER_API_KEY` in your `.env` file.

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

### Error: "OpenRouter authentication failed"

**Solution:** Verify your API key is correct and active at [OpenRouter.ai/keys](https://openrouter.ai/keys).

### Error: "OpenRouter rate limit exceeded"

**Solution:** 
- Wait a few seconds and try again (automatic retry is built-in)
- Upgrade your OpenRouter plan for higher rate limits
- Switch to a different model

### Backend won't start after migration

**Solution:**
1. Ensure you've installed updated dependencies: `pip install -r requirements.txt`
2. Check that legacy dependencies are removed: `pip uninstall anthropic google-generativeai huggingface_hub`
3. Verify `OPENROUTER_API_KEY` is set in `.env`

### Frontend shows old provider options

**Solution:**
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Restart the Next.js dev server

---

## Advanced Configuration

### Custom Retry Logic

Modify retry behavior in `openrouter_llm.py`:

```python
client = OpenRouterLLMClient(
    api_key=api_key,
    model_name=model_name,
    max_retries=5,        # Default: 3
    retry_delay=2.0,      # Default: 1.0 seconds
    timeout=120           # Default: 60 seconds
)
```

### Using Different Models for Different Tasks

You can programmatically switch models:

```python
# For SQL generation (needs precision)
assistant = TaskAssistant(db, provider="OPENROUTER", model_name="anthropic/claude-3.5-sonnet")

# For quick responses (speed matters)
assistant = TaskAssistant(db, provider="OPENROUTER", model_name="openai/gpt-4o-mini")
```

---

## Support

- **OpenRouter Documentation:** [openrouter.ai/docs](https://openrouter.ai/docs)
- **OpenRouter Discord:** [discord.gg/openrouter](https://discord.gg/openrouter)
- **Model Comparison:** [openrouter.ai/models](https://openrouter.ai/models)

---

## Rollback (If Needed)

If you need to temporarily rollback to the old system:

1. Checkout the previous commit: `git checkout <commit-before-migration>`
2. Reinstall old dependencies: `pip install anthropic google-generativeai huggingface_hub`
3. Restore your old `.env` settings

**Note:** We recommend staying on OpenRouter for better reliability and cost-effectiveness.
