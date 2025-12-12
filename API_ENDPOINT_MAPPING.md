# Complete API Endpoint Mapping

This document shows how Next.js API routes map to the backend FastAPI endpoints.

## Authentication Endpoints

| Next.js Route | Backend Endpoint | Method | Description |
|--------------|------------------|--------|-------------|
| `/api/auth/register` | `/auth/register` | POST | Register new user |
| `/api/auth/login` | `/auth/login` | POST | Login user |
| `/api/auth/refresh` | `/auth/refresh?refresh_token={token}` | POST | Refresh access token |
| `/api/auth/me` | `/auth/me` | GET | Get current user info |
| `/api/auth/logout` | N/A | POST | Delete session cookie |

## Task Endpoints

| Next.js Route | Backend Endpoint | Method | Description |
|--------------|------------------|--------|-------------|
| `/api/tasks` | `/tasks/` | GET | Get all tasks (with filters) |
| `/api/tasks` | `/tasks/` | POST | Create new task |
| `/api/tasks/[id]` | `/tasks/{id}` | PUT | Update task |
| `/api/tasks/[id]` | `/tasks/{id}` | DELETE | Delete task |
| `/api/tasks/assigned` | `/tasks/assigned` | GET | Get tasks assigned to user |
| `/api/tasks/export` | `/tasks/export` | GET | Export tasks to JSON |
| `/api/tasks/import` | `/tasks/import` | POST | Import tasks from JSON |

## Workspace Endpoints

| Next.js Route | Backend Endpoint | Method | Description |
|--------------|------------------|--------|-------------|
| `/api/workspaces` | `/workspaces/` | GET | List user's workspaces |
| `/api/workspaces` | `/workspaces/` | POST | Create workspace |
| `/api/workspaces/[id]` | `/workspaces/{id}` | GET | Get workspace details |
| `/api/workspaces/[id]/invite` | `/workspaces/{id}/invite` | POST | Create invitation token |
| `/api/workspaces/join/[token]` | `/workspaces/join/{token}` | POST | Join workspace |
| `/api/workspaces/[id]/members` | `/workspaces/{id}/members` | GET | List workspace members |
| `/api/workspaces/[id]/members/[userId]` | `/workspaces/{id}/members/{userId}` | DELETE | Remove member |

## Assistant Endpoints

| Next.js Route | Backend Endpoint | Method | Description |
|--------------|------------------|--------|-------------|
| `/api/assistant/chat` | `/assistant/chat` | POST | Chat with AI assistant |
| `/api/assistant/config` | `/assistant/config` | POST | Configure assistant |

## Analytics Endpoints

| Next.js Route | Backend Endpoint | Method | Description |
|--------------|------------------|--------|-------------|
| `/api/analytics` | `/analytics/` | GET | Get analytics data |

## Query Parameters

### GET /api/tasks
- `status` - Filter by task status (Pending, Completed)
- `priority` - Filter by priority (High, Medium, Low)
- `workspace_id` - Filter by workspace ID

### POST /api/auth/refresh
- `refresh_token` - The refresh token (query parameter)

## Request/Response Examples

### Create Task
```typescript
// Request
POST /api/tasks
{
  "title": "Complete report",
  "description": "Q4 financial report",
  "priority": "High",
  "deadline": "2025-12-15T17:00:00",
  "status": "Pending",
  "workspace_id": 1,
  "assigned_to_id": 2,
  "reminder_offset": 60
}

// Response
{
  "id": 123,
  "title": "Complete report",
  "description": "Q4 financial report",
  "priority": "High",
  "deadline": "2025-12-15T17:00:00",
  "status": "Pending",
  "workspace_id": 1,
  "user_id": 1,
  "assigned_to_id": 2,
  "reminder_offset": 60,
  "created_at": "2025-12-12T19:30:00",
  "updated_at": "2025-12-12T19:30:00"
}
```

### Create Workspace
```typescript
// Request
POST /api/workspaces
{
  "name": "Development Team",
  "description": "Main development workspace"
}

// Response
{
  "id": 1,
  "name": "Development Team",
  "description": "Main development workspace",
  "owner_id": 1,
  "created_at": "2025-12-12T19:30:00",
  "member_count": 1
}
```

### Invite to Workspace
```typescript
// Request
POST /api/workspaces/1/invite
{
  "email": "colleague@example.com"
}

// Response
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "workspace_id": 1,
  "expires_at": "2025-12-19T19:30:00"
}
```

### Join Workspace
```typescript
// Request
POST /api/workspaces/join/eyJ0eXAiOiJKV1QiLCJhbGc...

// Response
{
  "message": "Successfully joined workspace",
  "workspace_id": 1
}
```

### Export Tasks
```typescript
// Request
GET /api/tasks/export

// Response
{
  "tasks": [
    {
      "id": 1,
      "title": "Task 1",
      // ... all task fields
    },
    // ... more tasks
  ]
}
```

### Import Tasks
```typescript
// Request
POST /api/tasks/import
{
  "tasks": [
    {
      "title": "Imported Task 1",
      "priority": "High",
      "status": "Pending"
    },
    // ... more tasks
  ]
}

// Response
{
  "message": "Successfully imported 5 tasks"
}
```

## Authentication Flow

1. **Register/Login**: User provides credentials → Backend returns access_token + refresh_token
2. **Session Creation**: Next.js stores tokens in HTTP-only cookie
3. **API Calls**: Next.js automatically includes access_token in Authorization header
4. **Token Refresh**: On 401 error, Next.js calls `/api/auth/refresh` → Updates session
5. **Logout**: Next.js deletes session cookie

## Error Handling

All endpoints return consistent error format:
```typescript
{
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error
