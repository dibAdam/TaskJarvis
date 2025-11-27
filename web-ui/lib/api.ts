const API_BASE_URL = 'http://localhost:8000';

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  deadline?: string;
  status: string;
}

export interface ChatResponse {
  response: string;
  sql_query?: string;
}

export interface AnalyticsResponse {
  stats: string;
  chart_path?: string;
}

export const api = {
  // Tasks
  getTasks: async (status?: string, priority?: string): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    
    const res = await fetch(`${API_BASE_URL}/tasks/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  updateTask: async (id: number, updates: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  deleteTask: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Assistant
  chat: async (message: string): Promise<ChatResponse> => {
    const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to chat with assistant');
    return res.json();
  },

  configure: async (provider: string, model_name?: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/assistant/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, model_name }),
    });
    if (!res.ok) throw new Error('Failed to configure assistant');
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const res = await fetch(`${API_BASE_URL}/analytics/`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};
