'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function UserProfile() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    // Get user initials
    const initials = user.username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative">
            {/* Profile button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    {initials}
                </div>

                {/* User info */}
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-200">{user.username}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                </div>

                {/* Dropdown icon */}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </motion.div>
            </motion.button>

            {/* Dropdown menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden z-50"
                        >
                            {/* User info header */}
                            <div className="px-4 py-3 border-b border-slate-700/50">
                                <p className="text-sm font-medium text-slate-200">{user.username}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>

                            {/* Menu items */}
                            <div className="py-2">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>

                                <Link
                                    href="/"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-slate-700/50 py-2">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        logout();
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50 transition-colors w-full"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
