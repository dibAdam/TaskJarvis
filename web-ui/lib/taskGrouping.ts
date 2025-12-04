import { Task } from './api';

export interface TaskGroup {
  name: string;
  tasks: Task[];
  color: string;
  icon: string;
}

/**
 * Group tasks by time period (Today, Tomorrow, Upcoming, Overdue, Completed)
 */
export function groupTasksByTime(tasks: Task[]): TaskGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const groups: TaskGroup[] = [
    { name: 'Overdue', tasks: [], color: 'red', icon: '⚠️' },
    { name: 'Today', tasks: [], color: 'blue', icon: '📅' },
    { name: 'Tomorrow', tasks: [], color: 'purple', icon: '📆' },
    { name: 'Upcoming', tasks: [], color: 'green', icon: '📋' },
    { name: 'Completed', tasks: [], color: 'gray', icon: '✅' }
  ];

  tasks.forEach(task => {
    // Completed tasks go to their own group
    if (task.status === 'completed') {
      groups[4].tasks.push(task);
      return;
    }

    // If no deadline, put in upcoming
    if (!task.deadline) {
      groups[3].tasks.push(task);
      return;
    }

    // Parse deadline
    const deadline = new Date(task.deadline);
    
    // Check if overdue
    if (deadline < today) {
      groups[0].tasks.push(task);
    }
    // Check if today
    else if (deadline >= today && deadline < tomorrow) {
      groups[1].tasks.push(task);
    }
    // Check if tomorrow
    else if (deadline >= tomorrow && deadline < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
      groups[2].tasks.push(task);
    }
    // Otherwise upcoming
    else {
      groups[3].tasks.push(task);
    }
  });

  // Filter out empty groups (except completed)
  return groups.filter((group, index) => group.tasks.length > 0 || index === 4);
}

/**
 * Group tasks by priority (High, Medium, Low)
 */
export function groupTasksByPriority(tasks: Task[]): TaskGroup[] {
  const groups: TaskGroup[] = [
    { name: 'High Priority', tasks: [], color: 'red', icon: '🔴' },
    { name: 'Medium Priority', tasks: [], color: 'yellow', icon: '🟡' },
    { name: 'Low Priority', tasks: [], color: 'blue', icon: '🟢' }
  ];

  tasks.forEach(task => {
    if (task.status === 'completed') return; // Skip completed tasks

    switch (task.priority) {
      case 'High':
        groups[0].tasks.push(task);
        break;
      case 'Medium':
        groups[1].tasks.push(task);
        break;
      case 'Low':
        groups[2].tasks.push(task);
        break;
      default:
        groups[1].tasks.push(task); // Default to medium
    }
  });

  return groups.filter(group => group.tasks.length > 0);
}

/**
 * Sort tasks within a group by priority and deadline
 */
export function sortTasksWithinGroup(tasks: Task[]): Task[] {
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };

  return [...tasks].sort((a, b) => {
    // First sort by priority
    const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1;
    const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Then by deadline (earlier first)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    
    // Tasks with deadlines come before tasks without
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;

    // Finally by creation date (newer first)
    return b.id - a.id;
  });
}

/**
 * Filter tasks based on multiple criteria
 */
export interface TaskFilters {
  status?: string[];
  priority?: string[];
  searchQuery?: string;
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  let filtered = [...tasks];

  // Filter by status
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(task => filters.status!.includes(task.status));
  }

  // Filter by priority
  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(task => filters.priority!.includes(task.priority));
  }

  // Filter by search query
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  }

  return filtered;
}

/**
 * Get task statistics
 */
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  today: number;
  highPriority: number;
}

export function getTaskStats(tasks: Task[]): TaskStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length,
    overdue: tasks.filter(t => {
      if (t.status === 'completed' || !t.deadline) return false;
      return new Date(t.deadline) < today;
    }).length,
    today: tasks.filter(t => {
      if (t.status === 'completed' || !t.deadline) return false;
      const deadline = new Date(t.deadline);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return deadline >= today && deadline < tomorrow;
    }).length,
    highPriority: tasks.filter(t => t.status !== 'completed' && t.priority === 'High').length
  };
}
