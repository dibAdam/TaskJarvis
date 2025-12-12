# Server Session + Middleware - Quick Reference

## ✅ YES! You can check if user is logged in throughout the entire app!

## Where & How

| Location | Method | Example |
|----------|--------|---------|
| **Server Components** | `getServerSession()` | `const session = await getServerSession();` |
| **Server Components (Fast)** | `getUserFromHeaders()` | `const user = await getUserFromHeaders();` |
| **Server Actions** | `requireAuth()` | `const session = await requireAuth();` |
| **API Routes** | `getSession()` | `const session = await getSession();` |
| **Client Components** | `useAuth()` | `const { user, isAuthenticated } = useAuth();` |
| **Middleware** | Automatic | Runs on every request |

## Import Paths

```typescript
// Server-side (Server Components, Server Actions)
import { getServerSession, requireAuth, getUserFromHeaders } from '@/lib/server-auth';

// API Routes
import { getSession } from '@/lib/session';

// Client Components
import { useAuth } from '@/hooks/useAuth';
```

## Quick Examples

### Server Component
```typescript
// app/dashboard/page.tsx
import { getServerSession } from '@/lib/server-auth';

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    return <div>Not logged in</div>;
  }

  return <div>Welcome, {session.username}!</div>;
}
```

### Client Component
```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Hello, {user?.username}</div>;
}
```

### API Route
```typescript
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use session.accessToken for backend calls
  return NextResponse.json({ userId: session.userId });
}
```

### Server Action
```typescript
'use server';
import { requireAuth } from '@/lib/server-auth';

export async function deleteTask(taskId: number) {
  const session = await requireAuth(); // Throws if not authenticated
  
  // Perform action with session.accessToken
}
```

## Protected Routes (Automatic)

These routes are automatically protected by middleware:
- `/dashboard`
- `/profile`
- `/settings`
- `/tasks`
- `/workspaces`
- `/analytics`
- `/assistant`

**Unauthenticated users are automatically redirected to `/login`**

## Session Data Available

```typescript
{
  userId: number;          // User's ID
  email: string;           // User's email
  username: string;        // User's username
  accessToken: string;     // For backend API calls
  refreshToken: string;    // For token refresh
  expiresAt: Date;        // Session expiration
}
```

## Common Patterns

### Conditional Rendering
```typescript
const session = await getServerSession();

return (
  <div>
    {session ? (
      <UserDashboard user={session} />
    ) : (
      <LoginPrompt />
    )}
  </div>
);
```

### Require Authentication
```typescript
const session = await requireAuth(); // Throws if not authenticated

return <ProtectedContent user={session} />;
```

### Check in Layout
```typescript
// app/layout.tsx
export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html>
      <body>
        <Header user={session} />
        {children}
      </body>
    </html>
  );
}
```

## Security Features

✅ HTTP-only cookies (XSS protection)  
✅ Encrypted JWT (tamper-proof)  
✅ Automatic middleware protection  
✅ Server-side validation  
✅ Secure flag in production  
✅ CSRF protection (SameSite)  
✅ 7-day auto-expiration  

## Files

- `middleware.ts` - Route protection & session validation
- `lib/session.ts` - Session encryption/decryption
- `lib/server-auth.ts` - Server-side helpers
- `contexts/AuthContext.tsx` - Client-side context
- `hooks/useAuth.ts` - Client-side hook

## Full Documentation

See `SERVER_AUTH_GUIDE.md` for complete examples and patterns.
