import { getStoredToken, refreshToken as refreshAuthToken, logout } from './auth';

const API_BASE_URL = 'http://localhost:8000';

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  deadline?: string;
  status: string;
  reminder_offset?: number;  // Minutes before deadline to send reminder
}

export interface ChatResponse {
  response: string;
  sql_query?: string;
}

export interface AnalyticsResponse {
  stats: string;
  chart_path?: string;
}

/**
 * Get auth headers with current token
 */
function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Fetch with automatic token refresh on 401
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Add auth headers
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  let response = await fetch(url, { ...options, headers });

  // If 401, try to refresh token and retry
  if (response.status === 401) {
    try {
      await refreshAuthToken();
      
      // Retry with new token
      const newHeaders = {
        ...getAuthHeaders(),
        ...options.headers,
      };
      response = await fetch(url, { ...options, headers: newHeaders });
    } catch (error) {
      // Refresh failed, logout user
      logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
}

export const api = {
  // Tasks
  getTasks: async (status?: string, priority?: string): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    
    const res = await fetchWithAuth(`${API_BASE_URL}/tasks/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/tasks/`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  updateTask: async (id: number, updates: Partial<Task>): Promise<Task> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  deleteTask: async (id: number): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Assistant
  chat: async (message: string): Promise<ChatResponse> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/assistant/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to chat with assistant');
    return res.json();
  },

  configure: async (provider: string, model_name?: string): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/assistant/config`, {
      method: 'POST',
      body: JSON.stringify({ provider, model_name }),
    });
    if (!res.ok) throw new Error('Failed to configure assistant');
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/analytics/`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};
