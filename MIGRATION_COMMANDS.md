# Database Migration Guide

## Quick Reference

### Running Migrations (with environment variable)

Since your `.env` file has the DATABASE_URL, you need to set it in PowerShell before running Alembic:

```powershell
# Set the environment variable
$env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskJarvisDB"

# Generate a new migration (after model changes)
alembic revision --autogenerate -m "Description of changes"

# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# View current version
alembic current
```

### One-liner Commands

```powershell
# Generate and apply in one go
$env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskJarvisDB"; alembic revision --autogenerate -m "My changes"; alembic upgrade head
```

## What Just Happened

✅ **Migration Created**: `backend/migrations/versions/20251128_1414_fe676d02756d_initial_schema.py`

✅ **Tables Created in PostgreSQL**:
- `users` - User accounts with authentication
- `workspaces` - Team workspaces
- `workspace_members` - Workspace membership with roles
- `tasks` - Tasks with multi-user support
- `alembic_version` - Migration tracking

## Common Commands

### After Changing Models

1. **Create migration**:
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskJarvisDB"
   alembic revision --autogenerate -m "Added new field to User model"
   ```

2. **Review the generated migration file** in `backend/migrations/versions/`

3. **Apply the migration**:
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskJarvisDB"
   alembic upgrade head
   ```

### Rollback

```powershell
$env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskJarvisDB"
alembic downgrade -1  # Go back one migration
```

### Reset Database (DANGER!)

```powershell
$env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskJarvisDB"
alembic downgrade base  # Remove all migrations
alembic upgrade head    # Reapply all migrations
```

## Alternative: Load .env automatically

Install `python-dotenv` and modify your shell profile to auto-load `.env`:

```powershell
# Or use this helper script
# save as run-alembic.ps1
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}
alembic $args
```

Then use:
```powershell
.\run-alembic.ps1 upgrade head
.\run-alembic.ps1 revision --autogenerate -m "My changes"
```

## Troubleshooting

### Error: "DATABASE_URL environment variable must be set"
**Solution**: Set the environment variable before running Alembic:
```powershell
$env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskJarvisDB"
```

### Error: "No module named 'backend'"
**Solution**: Already fixed in `backend/migrations/env.py` with proper path setup

### Error: "Multiple version locations present"
**Solution**: Already fixed in `alembic.ini` by removing duplicate version_locations

## Next Steps

1. **Start the server**:
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/taskJarvisDB"
   uvicorn backend.main:app --reload
   ```

2. **Register a user** via API or web UI

3. **Start using TaskJarvis!**
