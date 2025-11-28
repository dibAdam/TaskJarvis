# TaskJarvis API Documentation

Complete API reference for TaskJarvis v2.0 with multi-user cloud support.

## Base URL

```
http://localhost:8000
```

## Authentication

All endpoints in cloud mode (except `/auth/*`) require JWT authentication.

### Headers

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Authentication Endpoints

### Register User

Create a new user account (cloud mode only).

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Login

Authenticate and receive tokens.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email_or_username": "user@example.com",
  "password": "securepassword"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Refresh Token

Get a new access token using refresh token.

**Endpoint**: `POST /auth/refresh?refresh_token=YOUR_REFRESH_TOKEN`

**Response**: `200 OK`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /auth/me`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Response**: `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "created_at": "2025-11-28T14:00:00"
}
```

---

## Workspace Endpoints

### Create Workspace

Create a new workspace for collaboration.

**Endpoint**: `POST /workspaces/`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body**:
```json
{
  "name": "My Team Workspace",
  "description": "Workspace for team collaboration"
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "My Team Workspace",
  "description": "Workspace for team collaboration",
  "owner_id": 1,
  "created_at": "2025-11-28T14:00:00",
  "member_count": 1
}
```

### List Workspaces

Get all workspaces the user is a member of.

**Endpoint**: `GET /workspaces/`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "My Team Workspace",
    "description": "Workspace for team collaboration",
    "owner_id": 1,
    "created_at": "2025-11-28T14:00:00",
    "member_count": 3
  }
]
```

### Get Workspace Details

Get details of a specific workspace.

**Endpoint**: `GET /workspaces/{workspace_id}`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "My Team Workspace",
  "description": "Workspace for team collaboration",
  "owner_id": 1,
  "created_at": "2025-11-28T14:00:00",
  "member_count": 3
}
```

### Invite to Workspace

Generate an invitation token for a workspace (admin/owner only).

**Endpoint**: `POST /workspaces/{workspace_id}/invite`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body**:
```json
{
  "email": "newmember@example.com"
}
```

**Response**: `200 OK`
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "workspace_id": 1,
  "expires_at": "2025-12-05T14:00:00"
}
```

### Join Workspace

Join a workspace using an invitation token.

**Endpoint**: `POST /workspaces/join/{invitation_token}`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Response**: `200 OK`
```json
{
  "message": "Successfully joined workspace",
  "workspace_id": 1
}
```

### List Workspace Members

Get all members of a workspace.

**Endpoint**: `GET /workspaces/{workspace_id}/members`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "username": "owner",
    "email": "owner@example.com",
    "role": "owner",
    "joined_at": "2025-11-28T14:00:00"
  },
  {
    "id": 2,
    "user_id": 2,
    "username": "member",
    "email": "member@example.com",
    "role": "member",
    "joined_at": "2025-11-28T15:00:00"
  }
]
```

### Remove Workspace Member

Remove a member from workspace (admin/owner only).

**Endpoint**: `DELETE /workspaces/{workspace_id}/members/{user_id}`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Response**: `200 OK`
```json
{
  "message": "Member removed successfully"
}
```

---

## Task Endpoints

### Get Tasks

Get tasks with optional filtering.

**Endpoint**: `GET /tasks/`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN` (optional in local mode)

**Query Parameters**:
- `status` (optional): Filter by status (Pending, Completed)
- `priority` (optional): Filter by priority (High, Medium, Low)
- `workspace_id` (optional): Filter by workspace

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Complete project report",
    "description": "Finish the Q4 report",
    "priority": "High",
    "deadline": "2025-12-01T17:00:00",
    "status": "Pending",
    "user_id": 1,
    "workspace_id": 1,
    "assigned_to_id": 2,
    "created_at": "2025-11-28T14:00:00",
    "updated_at": "2025-11-28T14:00:00"
  }
]
```

### Get Assigned Tasks

Get tasks assigned to the current user.

**Endpoint**: `GET /tasks/assigned`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Response**: `200 OK` (same format as Get Tasks)

### Create Task

Create a new task.

**Endpoint**: `POST /tasks/`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN` (optional in local mode)

**Request Body**:
```json
{
  "title": "Complete project report",
  "description": "Finish the Q4 report",
  "priority": "High",
  "deadline": "2025-12-01T17:00:00",
  "status": "Pending",
  "workspace_id": 1,
  "assigned_to_id": 2
}
```

**Response**: `200 OK` (task object)

### Update Task

Update an existing task.

**Endpoint**: `PUT /tasks/{task_id}`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN` (optional in local mode)

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "status": "Completed",
  "assigned_to_id": 3
}
```

**Response**: `200 OK` (updated task object)

### Delete Task

Delete a task.

**Endpoint**: `DELETE /tasks/{task_id}`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN` (optional in local mode)

**Response**: `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

### Export Tasks

Export all user's tasks to JSON.

**Endpoint**: `GET /tasks/export`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN` (optional in local mode)

**Response**: `200 OK`
```json
{
  "tasks": [
    { /* task object */ },
    { /* task object */ }
  ]
}
```

### Import Tasks

Import tasks from JSON.

**Endpoint**: `POST /tasks/import`

**Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN` (optional in local mode)

**Request Body**:
```json
{
  "tasks": [
    {
      "title": "Task 1",
      "description": "Description",
      "priority": "High",
      "deadline": "2025-12-01T17:00:00",
      "status": "Pending"
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "message": "Successfully imported 1 tasks"
}
```

---

## WebSocket Real-Time Sync

### Connect to Workspace

Establish WebSocket connection for real-time updates.

**Endpoint**: `WS /ws/{workspace_id}?token=YOUR_ACCESS_TOKEN`

**Example** (JavaScript):
```javascript
const ws = new WebSocket(
  `ws://localhost:8000/ws/1?token=${accessToken}`
);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  switch(data.type) {
    case 'connected':
      console.log('Connected to workspace', data.workspace_id);
      break;
    case 'task_created':
      console.log('New task:', data.task);
      break;
    case 'task_updated':
      console.log('Task updated:', data.task);
      break;
    case 'task_deleted':
      console.log('Task deleted:', data.task_id);
      break;
    case 'task_assigned':
      console.log('Task assigned to you:', data.task);
      break;
  }
};

// Send ping for keepalive
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
```

### Event Types

**Server → Client**:
- `connected`: Connection established
- `task_created`: New task created in workspace
- `task_updated`: Task updated in workspace
- `task_deleted`: Task deleted from workspace
- `task_assigned`: Task assigned to you
- `pong`: Response to ping

**Client → Server**:
- `ping`: Keepalive ping

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message description"
}
```

### Common Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently not implemented. Will be added in future versions.

---

## Pagination

Currently not implemented. All list endpoints return full results. Will be added in future versions.
