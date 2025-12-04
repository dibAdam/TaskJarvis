'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950 p-4 md:p-8">
                {/* Back button */}
                <Link href="/">
                    <motion.button
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6"
                        whileHover={{ x: -5 }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Tasks
                    </motion.button>
                </Link>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
                                {user.username.slice(0, 2).toUpperCase()}
                            </div>
                            <h1 className="text-3xl font-bold text-slate-200 mb-2">{user.username}</h1>
                            <p className="text-slate-400">{user.email}</p>
                        </div>

                        {/* Info sections */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <User className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-sm text-slate-400">Username</p>
                                    <p className="text-slate-200 font-medium">{user.username}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <Mail className="w-5 h-5 text-purple-400" />
                                <div>
                                    <p className="text-sm text-slate-400">Email</p>
                                    <p className="text-slate-200 font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <Calendar className="w-5 h-5 text-green-400" />
                                <div>
                                    <p className="text-sm text-slate-400">User ID</p>
                                    <p className="text-slate-200 font-medium">#{user.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Coming soon section */}
                        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-sm text-blue-300 text-center">
                                🚧 Profile editing and settings coming soon!
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </ProtectedRoute>
    );
}
