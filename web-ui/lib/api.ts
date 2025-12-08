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
  workspace_id?: number;  // Optional workspace assignment
}

export interface ChatResponse {
  response: string;
  sql_query?: string;
}

export interface AnalyticsResponse {
  stats: string;
  chart_path?: string;
}

export interface Workspace {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  created_at: string;
  member_count?: number;
}

export interface WorkspaceMember {
  id: number;
  user_id: number;
  username: string;
  email: string;
  role: string;  // 'owner', 'admin', or 'member'
  joined_at: string;
}

export interface InvitationToken {
  token: string;
  workspace_id: number;
  expires_at: string;
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
  },

  // Workspaces
  createWorkspace: async (name: string, description?: string): Promise<Workspace> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/`, {
      method: 'POST',
      body: JSON.stringify({ name, description: description || '' }),
    });
    if (!res.ok) throw new Error('Failed to create workspace');
    return res.json();
  },

  listWorkspaces: async (): Promise<Workspace[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/`);
    if (!res.ok) throw new Error('Failed to fetch workspaces');
    return res.json();
  },

  getWorkspace: async (workspaceId: number): Promise<Workspace> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${workspaceId}`);
    if (!res.ok) throw new Error('Failed to fetch workspace');
    return res.json();
  },

  inviteToWorkspace: async (workspaceId: number, email: string): Promise<InvitationToken> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${workspaceId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Failed to create invitation');
    return res.json();
  },

  joinWorkspace: async (token: string): Promise<{ message: string; workspace_id: number }> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/join/${token}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to join workspace');
    return res.json();
  },

  listWorkspaceMembers: async (workspaceId: number): Promise<WorkspaceMember[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${workspaceId}/members`);
    if (!res.ok) throw new Error('Failed to fetch workspace members');
    return res.json();
  },

  removeWorkspaceMember: async (workspaceId: number, userId: number): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove member');
  }
};
