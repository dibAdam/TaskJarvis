'use client';

import React, { useState, useEffect } from 'react';
import { api, Task } from '@/lib/api';
import { TaskList } from '@/components/TaskList';
import { ChatInterface } from '@/components/ChatInterface';
import { Dashboard } from '@/components/Dashboard';
import { Settings } from '@/components/Settings';
import { LayoutDashboard, ListTodo, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '@/lib/animations';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserProfile } from '@/components/UserProfile';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'dashboard'>('tasks');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

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
      await api.updateTask(id, { status: 'completed' });
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

  const handleUpdate = async (id: number, updates: Partial<Task>) => {
    try {
      await api.updateTask(id, updates);
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">⚡</span>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
                  TaskJarvis
                </h1>
                <p className="text-sm text-slate-400">AI-Powered Task Manager</p>
              </div>
            </div>

            {/* Center: Tab Navigation */}
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 relative backdrop-blur-md">
              <motion.button
                onClick={() => setActiveTab('tasks')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all z-10 ${activeTab === 'tasks'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ListTodo className="w-4 h-4" />
                Tasks
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('dashboard')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all z-10 ${activeTab === 'dashboard'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Board
              </motion.button>

              {/* Animated Background */}
              <motion.div
                className="absolute top-1 bottom-1 bg-slate-800 rounded-lg shadow-sm"
                initial={false}
                animate={{
                  left: activeTab === 'tasks' ? '4px' : 'calc(50% + 2px)',
                  width: activeTab === 'tasks' ? 'calc(50% - 6px)' : 'calc(50% - 6px)'
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30
                }}
              />
            </div>

            {/* Right: User Profile */}
            <UserProfile />
          </div>
        </header>

        {/* Main Layout */}
        <div className="pt-24 px-4 md:px-8 pb-8 max-w-[1600px] mx-auto">
          <div className="lg:mr-[420px]">
            {/* Main Content Area with Page Transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {activeTab === 'tasks' ? (
                  <TaskList
                    tasks={tasks}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    loading={loading}
                  />
                ) : (
                  <div className="space-y-6">
                    <Dashboard />
                    <Settings />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Fixed Chat Interface - Desktop Only */}
          <div className="fixed right-8 top-24 bottom-8 w-[400px] hidden lg:flex flex-col">
            <ChatInterface onTaskUpdate={fetchTasks} />
          </div>

          {/* Mobile Chat Drawer */}
          <AnimatePresence>
            {isMobileChatOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileChatOpen(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                />

                {/* Drawer */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-slate-950 z-50 lg:hidden flex flex-col"
                >
                  {/* Close Button */}
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-200">Task Assistant</h2>
                    <motion.button
                      onClick={() => setIsMobileChatOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Chat Interface */}
                  <div className="flex-1 overflow-hidden">
                    <ChatInterface onTaskUpdate={fetchTasks} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Floating Chat Button - Mobile Only */}
          <motion.button
            onClick={() => setIsMobileChatOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-linear-to-br from-blue-600 to-purple-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white z-30 lg:hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        </div>
      </main>
    </ProtectedRoute >
  );
}
