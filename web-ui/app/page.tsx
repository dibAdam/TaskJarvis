'use client';

import React, { useState, lazy, Suspense } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Dashboard } from '@/components/Dashboard';
import { Settings } from '@/components/Settings';

// Lazy load ChatInterface for better code splitting
const ChatInterface = lazy(() => import('@/components/ChatInterface').then(module => ({ default: module.ChatInterface })));

// Loading component for ChatInterface
const ChatLoading = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

export default function Home() {
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
        {/* Use CSS Grid for stable layout */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-[1800px] mx-auto">
            {/* Main Content Area */}
            <div className="space-y-6 min-w-0">
              <Dashboard />
              <Settings />
            </div>

            {/* Chat Interface - Desktop Only */}
            <div className="hidden lg:block">
              <div className="sticky top-24 h-[calc(100vh-8rem)]">
                <Suspense fallback={<ChatLoading />}>
                  <ChatInterface onTaskUpdate={() => { }} />
                </Suspense>
              </div>
            </div>
          </div>
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
                aria-hidden="true"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-slate-950 z-50 lg:hidden flex flex-col"
                role="dialog"
                aria-label="Chat assistant"
              >
                {/* Close Button */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-200">Task Assistant</h2>
                  <motion.button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close chat"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </motion.button>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden">
                  <Suspense fallback={<ChatLoading />}>
                    <ChatInterface onTaskUpdate={() => { }} />
                  </Suspense>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Chat Button - Mobile Only */}
        <motion.button
          onClick={() => setIsMobileChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white z-30 lg:hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Open chat assistant"
        >
          <MessageSquare className="w-6 h-6" aria-hidden="true" />
        </motion.button>
      </div>
    </ProtectedRoute>
  );
}
