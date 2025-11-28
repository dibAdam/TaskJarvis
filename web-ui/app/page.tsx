'use client';

import React, { useState, useEffect } from 'react';
import { api, Task } from '@/lib/api';
import { TaskList } from '@/components/TaskList';
import { ChatInterface } from '@/components/ChatInterface';
import { Dashboard } from '@/components/Dashboard';
import { Settings } from '@/components/Settings';
import { LayoutDashboard, ListTodo, MessageSquare } from 'lucide-react';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'dashboard'>('tasks');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (id: number) => {
    try {
      await api.updateTask(id, { status: 'Completed' });
      fetchTasks();
    } catch (error) {
      console.error('Failed to complete task', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
              TaskJarvis
            </h1>
            <p className="text-sm text-slate-400">AI-Powered Task Manager</p>
          </div>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <ListTodo className="w-4 h-4" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pt-24 px-4 md:px-8 pb-8 max-w-[1600px] mx-auto w-9/12 m-auto">
        <div className="lg:mr-[420px]">
          {/* Main Content Area */}
          <div className="space-y-6">
            {activeTab === 'tasks' ? (
              <TaskList
                tasks={tasks}
                onComplete={handleComplete}
                onDelete={handleDelete}
                loading={loading}
              />
            ) : (
              <div className="space-y-6">
                <Dashboard />
                <Settings />
              </div>
            )}
          </div>
        </div>

        {/* Fixed Chat Interface - Right Side */}
        <div className="fixed right-8 top-24 bottom-8 w-[600px] hidden lg:flex flex-col">
          <ChatInterface onTaskUpdate={fetchTasks} />
        </div>
      </div>
    </main>
  );
}
