# TaskJarvis

AI-powered personal productivity assistant.

## Setup

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    ```

2.  Run the application:
    ```bash
    python main.py
    ```

## Structure

- `tasks/`: Task management logic.
- `nlp/`: Natural language command parsing.
- `notifications/`: System notifications.
- `analytics/`: Productivity stats.
- `config/`: Configuration settings.
