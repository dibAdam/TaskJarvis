"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Loader2 } from 'lucide-react';
import { WorkspaceProvider, useWorkspace } from '@/contexts/WorkspaceContext';
import WorkspaceCard from '@/components/WorkspaceCard';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';

function WorkspacesPageContent() {
    const { workspaces, isLoading, refreshWorkspaces } = useWorkspace();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        // Get current user ID from localStorage (set during login)
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setCurrentUserId(user.id);
            } catch (err) {
                console.error('Failed to parse user data:', err);
            }
        }
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Workspaces</h1>
                            <p className="text-white/60">Collaborate with your team on tasks and projects</p>
                        </div>

                        <motion.button
                            onClick={() => setIsCreateModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            Create Workspace
                        </motion.button>
                    </motion.div>
                </div>

                {/* Workspaces Grid */}
                {workspaces.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {workspaces.map((workspace, index) => (
                            <motion.div
                                key={workspace.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <WorkspaceCard
                                    workspace={workspace}
                                    isOwner={currentUserId === workspace.owner_id}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mb-6">
                            <Users className="w-16 h-16 text-white/40" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">No workspaces yet</h2>
                        <p className="text-white/60 mb-6 text-center max-w-md">
                            Create your first workspace to start collaborating with your team
                        </p>
                        <motion.button
                            onClick={() => setIsCreateModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium shadow-lg shadow-blue-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Workspace
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Create Workspace Modal */}
            <CreateWorkspaceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}

export default function WorkspacesPage() {
    return (
        <WorkspaceProvider>
            <WorkspacesPageContent />
        </WorkspaceProvider>
    );
}
