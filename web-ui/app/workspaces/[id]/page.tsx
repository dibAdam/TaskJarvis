"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, UserPlus, Settings, LogOut, Loader2, Calendar, Crown } from 'lucide-react';
import { api, Workspace, WorkspaceMember } from '@/lib/api';
import WorkspaceMemberList from '@/components/WorkspaceMemberList';
import InviteMemberModal from '@/components/InviteMemberModal';

export default function WorkspaceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = parseInt(params.id as string);

    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string>('member');

    useEffect(() => {
        // Get current user ID
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setCurrentUserId(user.id);
            } catch (err) {
                console.error('Failed to parse user data:', err);
            }
        }

        loadWorkspaceData();
    }, [workspaceId]);

    useEffect(() => {
        // Determine current user's role
        if (currentUserId && members.length > 0) {
            const currentMember = members.find(m => m.user_id === currentUserId);
            if (currentMember) {
                setCurrentUserRole(currentMember.role);
            }
        }
    }, [currentUserId, members]);

    const loadWorkspaceData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [workspaceData, membersData] = await Promise.all([
                api.getWorkspace(workspaceId),
                api.listWorkspaceMembers(workspaceId),
            ]);

            setWorkspace(workspaceData);
            setMembers(membersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load workspace');
            console.error('Error loading workspace:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMemberRemoved = () => {
        loadWorkspaceData();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !workspace) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center py-20">
                        <p className="text-red-400 mb-4">{error || 'Workspace not found'}</p>
                        <button
                            onClick={() => router.push('/workspaces')}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
                        >
                            Back to Workspaces
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const canInviteMembers = currentUserRole === 'owner' || currentUserRole === 'admin';
    const isOwner = currentUserId === workspace.owner_id;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <motion.button
                    onClick={() => router.push('/workspaces')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Workspaces
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
                                <Users className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">{workspace.name}</h1>
                                {workspace.description && (
                                    <p className="text-white/60">{workspace.description}</p>
                                )}
                            </div>
                        </div>

                        {isOwner && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                                <Crown className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-medium text-yellow-300">Owner</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Created {new Date(workspace.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Members Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Members</h2>

                        {canInviteMembers && (
                            <motion.button
                                onClick={() => setIsInviteModalOpen(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-500 to-blue-500 rounded-xl text-white font-medium shadow-lg shadow-green-500/25"
                            >
                                <UserPlus className="w-4 h-4" />
                                Invite Members
                            </motion.button>
                        )}
                    </div>

                    <WorkspaceMemberList
                        members={members}
                        workspaceId={workspaceId}
                        currentUserId={currentUserId || 0}
                        currentUserRole={currentUserRole}
                        onMemberRemoved={handleMemberRemoved}
                    />
                </motion.div>
            </div>

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                workspaceId={workspaceId}
                workspaceName={workspace.name}
            />
        </div>
    );
}
