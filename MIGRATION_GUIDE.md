# Migration Guide: Local to Cloud Mode

This guide helps you migrate your existing TaskJarvis installation from local mode (SQLite, single-user) to cloud mode (PostgreSQL, multi-user).

## Prerequisites

- PostgreSQL database (local or cloud-hosted)
- Python 3.10+
- All dependencies installed (`pip install -r requirements.txt`)

## Step 1: Export Your Existing Tasks

While still in local mode:

```bash
# Start the server in local mode (default)
uvicorn api.main:app --reload

# Export your tasks via API
curl http://localhost:8000/tasks/export > my_tasks.json
```

Alternatively, use the web UI to export tasks.

## Step 2: Set Up PostgreSQL

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (Windows)
# Download from https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE taskjarvis;
CREATE USER taskjarvis_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE taskjarvis TO taskjarvis_user;
\q
```

### Option B: Cloud PostgreSQL

Use a cloud provider like:
- **Heroku Postgres**
- **AWS RDS**
- **Google Cloud SQL**
- **Supabase**
- **Neon**

Get your connection string in the format:
```
postgresql://username:password@host:port/database
```

## Step 3: Configure Environment Variables

Update your `.env` file:

```env
# Switch to cloud mode
APP_MODE=cloud

# PostgreSQL connection string
DATABASE_URL=postgresql://taskjarvis_user:your_password@localhost:5432/taskjarvis

# JWT secret (generate a secure random string)
JWT_SECRET_KEY=your-very-secure-secret-key-here

# Keep your existing LLM API keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
# ... etc
```

**Important**: Generate a secure JWT secret key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 4: Run Database Migrations

```bash
# Initialize Alembic (first time only)
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

## Step 5: Create Your User Account

Start the server in cloud mode:

```bash
uvicorn backend.main:app --reload
```

Register via API or web UI:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "username": "yourusername",
    "password": "your_secure_password"
  }'
```

Save the returned `access_token` and `refresh_token`.

## Step 6: Import Your Tasks

```bash
curl -X POST http://localhost:8000/tasks/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @my_tasks.json
```

## Step 7: Verify Migration

1. Login to the web UI
2. Verify all your tasks are present
3. Test creating, updating, and deleting tasks
4. Check analytics dashboard

## Troubleshooting

### Connection Errors

**Error**: `could not connect to server`

**Solution**: Verify PostgreSQL is running and connection string is correct.

```bash
# Test connection
psql postgresql://taskjarvis_user:your_password@localhost:5432/taskjarvis
```

### Migration Errors

**Error**: `Target database is not up to date`

**Solution**: Run migrations:
```bash
alembic upgrade head
```

### Authentication Errors

**Error**: `Invalid authentication credentials`

**Solution**: 
1. Verify JWT_SECRET_KEY is set in `.env`
2. Restart the server after changing `.env`
3. Re-login to get new tokens

### Import Errors

**Error**: `Authentication required`

**Solution**: Include the Bearer token in the Authorization header.

## Rollback to Local Mode

If you need to go back to local mode:

1. Change `.env`: `APP_MODE=local`
2. Restart server
3. Your old SQLite database (`tasks.db`) is still intact

## Next Steps

- [Create workspaces](API_DOCUMENTATION.md#workspaces) for team collaboration
- [Invite team members](API_DOCUMENTATION.md#invitations)
- [Set up real-time sync](API_DOCUMENTATION.md#websocket) in your web UI
- Configure production deployment (see README.md)
