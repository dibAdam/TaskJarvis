// Authentication utility functions for TaskJarvis
const API_URL = 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'taskjarvis_access_token';
const REFRESH_TOKEN_KEY = 'taskjarvis_refresh_token';

/**
 * Store authentication tokens in localStorage
 */
export function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Get stored access token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get stored refresh token
 */
export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear all stored tokens
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}

/**
 * Login user with email/username and password
 */
export async function login(emailOrUsername: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_or_username: emailOrUsername,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  storeTokens(data.access_token, data.refresh_token);

  // Fetch user info
  const user = await getCurrentUser(data.access_token);
  return user;
}

/**
 * Register new user
 */
export async function register(
  email: string,
  username: string,
  password: string
): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      username,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  const data: LoginResponse = await response.json();
  storeTokens(data.access_token, data.refresh_token);

  // Fetch user info
  const user = await getCurrentUser(data.access_token);
  return user;
}

/**
 * Get current user information
 */
export async function getCurrentUser(token?: string): Promise<User> {
  const accessToken = token || getStoredToken();
  
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(): Promise<string> {
  const refreshTokenValue = getStoredRefreshToken();

  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: refreshTokenValue,
    }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Token refresh failed');
  }

  const data: LoginResponse = await response.json();
  storeTokens(data.access_token, data.refresh_token);

  return data.access_token;
}

/**
 * Logout user and clear tokens
 */
export function logout(): void {
  clearTokens();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
