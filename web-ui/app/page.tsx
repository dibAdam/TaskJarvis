'use client';

import React, { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { Dashboard } from '@/components/Dashboard';
import { Settings } from '@/components/Settings';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Home() {
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
        <div className="max-w-[calc(100vw-350px)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:mr-[420px]">
            <div className="space-y-6">
              <Dashboard />
              <Settings />
            </div>
          </div>

          {/* Fixed Chat Interface - Desktop Only */}
          <div className="fixed right-8 top-24 bottom-8 w-[400px] hidden lg:flex flex-col">
            <ChatInterface onTaskUpdate={() => { }} />
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
                    <ChatInterface onTaskUpdate={() => { }} />
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
      </div>
    </ProtectedRoute>
  );
}


