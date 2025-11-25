# TaskJarvis

TaskJarvis is a modular, AI-powered personal productivity assistant. This walkthrough demonstrates how to set up, run, and verify the application.

## 1. Setup

Ensure you have Python 3.x installed.

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    ```

2.  **Run the Application**:
    ```bash
    python main.py
    ```

## 2. Usage Examples

Once the application is running, you can interact with it using natural language or specific commands.

### Adding Tasks
- "Add task Buy groceries tomorrow"
- "Remind me to finish the report by Friday"
- "Add task Call Mom priority High"

### Listing Tasks
- "List tasks"
- "Show my tasks"

### Completing & Deleting
- "Complete task 1"
- "Delete task 2"

### Analytics
- "Show analytics"
- "Stats"
(This will display productivity stats and generate `analytics.png` chart)

## 3. Verification

The project includes a test suite to ensure core functionality works as expected.

### Running Tests
Run the following command to execute unit tests:
```bash
python -m pytest tests/
```

**Expected Output**:
```
tests/test_task.py ....                                                  [100%]
4 passed in 0.xxs
```

## 4. Project Structure

- `main.py`: Entry point.
- `tasks/`: Core task logic and database (SQLite).
- `nlp/`: Natural language parsing (spaCy).
- `notifications/`: Desktop notifications (plyer).
- `analytics/`: Productivity dashboard (matplotlib).
- `config/`: Settings.
- `tests/`: Unit tests.
