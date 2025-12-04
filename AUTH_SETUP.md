# TaskJarvis Authentication Setup

## Quick Start

### 1. Switch to the New Backend

Stop the current backend and start the new one with authentication:

```powershell
# Stop current backend (Ctrl+C in the terminal)

# Start new backend with authentication
uvicorn backend.main:app --reload
```

### 2. Seed the Database

Run the seeder to create a default user and sample tasks:

```powershell
python seed_database.py
```

This will create:
- **Default User:**
  - Email: `admin@taskjarvis.com`
  - Username: `admin`
  - Password: `admin123`
- **5 Sample Tasks** (including 1 completed task)

### 3. Login

1. Navigate to `http://localhost:3000`
2. You'll be redirected to the login page
3. Login with:
   - Email/Username: `admin` or `admin@taskjarvis.com`
   - Password: `admin123`

## Features Implemented

✅ **Authentication System**
- User registration with password strength indicator
- Login with email or username
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- User profile dropdown

✅ **UI Components**
- Beautiful glassmorphism login/register pages
- User profile with avatar
- Protected route wrapper
- Profile page

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info

### Tasks (requires authentication)
- `GET /tasks/` - Get all tasks
- `POST /tasks/` - Create task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

## Environment Variables

Make sure you have these in your `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/taskjarvis

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Troubleshooting

### Backend not starting?
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations if needed

### Can't login?
- Make sure you ran `python seed_database.py`
- Check backend console for errors
- Verify backend is running on port 8000

### Token errors?
- Clear browser localStorage
- Re-login
- Check SECRET_KEY in .env

## Next Steps

Phase 2 will add:
- Workspace management
- Team collaboration
- Task assignment
- Real-time sync via WebSocket
