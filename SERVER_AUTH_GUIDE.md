# Server-Side Authentication Guide

## Overview

You now have **full server-side authentication** using Server Sessions + Middleware throughout your entire app! 🎉

## How It Works

### 1. **Middleware** (`middleware.ts`)
- Runs on **every request** before any page loads
- Checks if user has a valid session cookie
- Protects routes automatically
- Adds user info to request headers
- Redirects unauthenticated users to login
- Redirects authenticated users away from login/register pages

### 2. **Server Session** (`lib/session.ts`)
- Stores user data in encrypted HTTP-only cookies
- Secure and tamper-proof (JWT-based)
- Automatically included in all requests
- No localStorage or client-side storage needed

### 3. **Server Auth Helpers** (`lib/server-auth.ts`)
- Easy-to-use functions for Server Components
- Check authentication status
- Get user information
- Require authentication

## Usage Examples

### In Server Components (Recommended)

```typescript
// app/dashboard/page.tsx
import { getServerSession, requireAuth, getUserFromHeaders } from '@/lib/server-auth';

// Option 1: Get session (returns null if not authenticated)
export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.username}!</h1>
      <p>Email: {session.email}</p>
      <p>User ID: {session.userId}</p>
    </div>
  );
}

// Option 2: Require auth (throws error if not authenticated)
export default async function ProfilePage() {
  const session = await requireAuth(); // Will throw if not authenticated
  
  return (
    <div>
      <h1>Profile: {session.username}</h1>
    </div>
  );
}

// Option 3: Get from headers (fastest, set by middleware)
export default async function TasksPage() {
  const user = await getUserFromHeaders();
  
  if (!user.isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Tasks for User #{user.userId}</h1>
    </div>
  );
}
```

### In Server Actions

```typescript
// app/actions/task-actions.ts
'use server';

import { requireAuth } from '@/lib/server-auth';

export async function createTask(formData: FormData) {
  // Ensure user is authenticated
  const session = await requireAuth();
  
  const title = formData.get('title') as string;
  
  // Create task with authenticated user's ID
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      title,
      user_id: session.userId,
    }),
  });
  
  return await response.json();
}
```

### In Route Handlers (Already Implemented)

```typescript
// app/api/tasks/route.ts
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (!session?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Use session.accessToken for backend API calls
  const response = await fetch(`${API_URL}/tasks/`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  return NextResponse.json(await response.json());
}
```

### In Client Components (Using Context)

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export function UserProfile() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h2>{user?.username}</h2>
      <p>{user?.email}</p>
    </div>
  );
}
```

## Protected Routes

The middleware automatically protects these routes:

```typescript
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/tasks',
  '/workspaces',
  '/analytics',
  '/assistant'
];
```

**What happens:**
- User tries to access `/dashboard` without being logged in
- Middleware detects no session
- Redirects to `/login?redirect=/dashboard`
- After login, user is redirected back to `/dashboard`

## Authentication Flow

### Login Flow
```
1. User submits login form
2. POST /api/auth/login
3. Backend validates credentials
4. Returns access_token + refresh_token
5. Next.js creates encrypted session cookie
6. Cookie stored as HTTP-only (secure)
7. User redirected to /dashboard
8. Middleware allows access (session exists)
```

### Page Access Flow
```
1. User navigates to /tasks
2. Middleware runs first
3. Checks session cookie
4. If valid: adds user info to headers, allows access
5. If invalid: redirects to /login?redirect=/tasks
6. Server Component can use getServerSession() or getUserFromHeaders()
7. Page renders with user data
```

### Logout Flow
```
1. User clicks logout
2. POST /api/auth/logout
3. Session cookie deleted
4. User redirected to /login
5. Middleware blocks access to protected routes
```

## Checking Authentication Anywhere

### Server Components
```typescript
import { isAuthenticated, getServerSession } from '@/lib/server-auth';

// Simple boolean check
const isLoggedIn = await isAuthenticated();

// Get full session
const session = await getServerSession();
if (session) {
  console.log(`User ${session.username} is logged in`);
}
```

### Client Components
```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

const { isAuthenticated, user, loading } = useAuth();
```

### API Routes
```typescript
import { getSession } from '@/lib/session';

const session = await getSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Session Data Available

```typescript
interface SessionPayload {
  userId: number;          // User's database ID
  email: string;           // User's email
  username: string;        // User's username
  accessToken: string;     // JWT for backend API calls
  refreshToken: string;    // JWT for refreshing access token
  expiresAt: Date;        // Session expiration
}
```

## Security Features

✅ **HTTP-only cookies** - JavaScript cannot access session  
✅ **Encrypted JWT** - Session data is encrypted  
✅ **Secure flag** - HTTPS only in production  
✅ **SameSite: lax** - CSRF protection  
✅ **7-day expiration** - Auto-logout after inactivity  
✅ **Server-side validation** - Every request validates session  
✅ **Automatic token refresh** - Seamless re-authentication  

## Benefits Over Client-Side Auth

| Feature | Server Session | Client-Side (localStorage) |
|---------|---------------|---------------------------|
| **Security** | ✅ HTTP-only, encrypted | ❌ Accessible by JavaScript |
| **XSS Protection** | ✅ Cannot be stolen | ❌ Vulnerable |
| **SSR Support** | ✅ Works in Server Components | ❌ Client-only |
| **SEO** | ✅ Can render user-specific content | ❌ Shows loading state |
| **Performance** | ✅ No client-side checks needed | ❌ Extra API calls |
| **Middleware** | ✅ Protects routes automatically | ❌ Requires client-side routing |

## Common Patterns

### Conditional Rendering Based on Auth

```typescript
// Server Component
export default async function HomePage() {
  const session = await getServerSession();

  return (
    <div>
      {session ? (
        <div>
          <h1>Welcome back, {session.username}!</h1>
          <Link href="/dashboard">Go to Dashboard</Link>
        </div>
      ) : (
        <div>
          <h1>Welcome to TaskJarvis</h1>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      )}
    </div>
  );
}
```

### Protecting Server Actions

```typescript
'use server';

import { requireAuth } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';

export async function deleteTask(taskId: number) {
  const session = await requireAuth();
  
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  
  revalidatePath('/tasks');
}
```

### Getting User in Layout

```typescript
// app/layout.tsx
import { getServerSession } from '@/lib/server-auth';

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html>
      <body>
        <nav>
          {session ? (
            <>
              <span>Hello, {session.username}</span>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </nav>
        {children}
      </body>
    </html>
  );
}
```

## Answer: Can You Check If User Is Logged In Throughout The App?

# YES! ✅

You can check if the user is logged in **anywhere** in your app:

1. **Server Components** → `await getServerSession()` or `await isAuthenticated()`
2. **Client Components** → `useAuth()` hook
3. **API Routes** → `await getSession()`
4. **Server Actions** → `await requireAuth()`
5. **Middleware** → Already checking on every request
6. **Layouts** → `await getServerSession()`

The session is available **everywhere** and is **automatically validated** on every request by the middleware!
