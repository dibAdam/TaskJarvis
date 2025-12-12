// Updated authentication utility functions for TaskJarvis
// Now uses server-side sessions instead of localStorage

export interface User {
  id: number;
  email: string;
  username: string;
}

/**
 * Login user with email/username and password
 */
export async function login(emailOrUsername: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

/**
 * Register new user
 */
export async function register(
  email: string,
  username: string,
  password: string
): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<User> {
  const response = await fetch('/api/auth/me');

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<void> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

/**
 * Check if user is authenticated (for client-side only)
 * For server-side, use getSession() from lib/session.ts
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}