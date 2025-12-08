"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { ChevronDown, Users, Globe } from 'lucide-react';

export default function WorkspaceSelector() {
    const { workspaces, currentWorkspace, setCurrentWorkspace, isLoading } = useWorkspace();
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="relative">
                <div className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                    <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center gap-2">
                    {currentWorkspace ? (
                        <Users className="w-4 h-4 text-blue-400" />
                    ) : (
                        <Globe className="w-4 h-4 text-purple-400" />
                    )}
                    <span className="text-sm font-medium text-white">
                        {currentWorkspace ? currentWorkspace.name : 'All Workspaces'}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white/80 transition-colors" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full mt-2 right-0 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                            <div className="p-2">
                                {/* All Workspaces Option */}
                                <motion.button
                                    onClick={() => {
                                        setCurrentWorkspace(null);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${!currentWorkspace
                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                        }`}
                                    whileHover={{ x: 4 }}
                                >
                                    <Globe className="w-4 h-4" />
                                    <span className="text-sm font-medium">All Workspaces</span>
                                </motion.button>

                                {workspaces.length > 0 && (
                                    <>
                                        <div className="my-2 h-px bg-white/10" />

                                        {/* Workspace List */}
                                        <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                                            {workspaces.map((workspace) => (
                                                <motion.button
                                                    key={workspace.id}
                                                    onClick={() => {
                                                        setCurrentWorkspace(workspace);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${currentWorkspace?.id === workspace.id
                                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                    whileHover={{ x: 4 }}
                                                >
                                                    <Users className="w-4 h-4 shrink-0" />
                                                    <div className="flex-1 text-left overflow-hidden">
                                                        <div className="text-sm font-medium truncate">
                                                            {workspace.name}
                                                        </div>
                                                        {workspace.member_count !== undefined && (
                                                            <div className="text-xs text-white/40">
                                                                {workspace.member_count} {workspace.member_count === 1 ? 'member' : 'members'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {workspaces.length === 0 && (
                                    <div className="px-3 py-4 text-center text-white/40 text-sm">
                                        No workspaces yet
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
