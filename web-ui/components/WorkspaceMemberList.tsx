"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkspaceMember } from '@/lib/api';
import { Crown, Shield, User, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface WorkspaceMemberListProps {
    members: WorkspaceMember[];
    workspaceId: number;
    currentUserId: number;
    currentUserRole: string;
    onMemberRemoved: () => void;
}

export default function WorkspaceMemberList({
    members,
    workspaceId,
    currentUserId,
    currentUserRole,
    onMemberRemoved
}: WorkspaceMemberListProps) {
    const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
    const [confirmRemove, setConfirmRemove] = useState<number | null>(null);

    const canRemoveMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

    const handleRemoveMember = async (userId: number) => {
        try {
            setRemovingMemberId(userId);
            await api.removeWorkspaceMember(workspaceId, userId);
            onMemberRemoved();
            setConfirmRemove(null);
        } catch (err) {
            console.error('Failed to remove member:', err);
            alert('Failed to remove member. Please try again.');
        } finally {
            setRemovingMemberId(null);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner':
                return <Crown className="w-4 h-4 text-yellow-400" />;
            case 'admin':
                return <Shield className="w-4 h-4 text-blue-400" />;
            default:
                return <User className="w-4 h-4 text-gray-400" />;
        }
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            owner: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
            admin: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
            member: 'bg-gray-500/20 border-gray-500/30 text-gray-300',
        };

        return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg ${styles[role as keyof typeof styles] || styles.member}`}>
                {getRoleIcon(role)}
                <span className="text-xs font-medium capitalize">{role}</span>
            </div>
        );
    };

    if (members.length === 0) {
        return (
            <div className="text-center py-12">
                <User className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No members yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {members.map((member, index) => (
                <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all duration-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                                <span className="text-white font-semibold text-lg">
                                    {member.username.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-medium truncate">
                                        {member.username}
                                        {member.user_id === currentUserId && (
                                            <span className="text-white/50 text-sm ml-2">(You)</span>
                                        )}
                                    </h4>
                                </div>
                                <p className="text-sm text-white/60 truncate">{member.email}</p>
                                <p className="text-xs text-white/40 mt-1">
                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Role & Actions */}
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                            {getRoleBadge(member.role)}

                            {/* Remove Button */}
                            {canRemoveMembers &&
                                member.role !== 'owner' &&
                                member.user_id !== currentUserId && (
                                    <motion.button
                                        onClick={() => setConfirmRemove(member.user_id)}
                                        disabled={removingMemberId === member.user_id}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                )}
                        </div>
                    </div>

                    {/* Confirmation Dialog */}
                    <AnimatePresence>
                        {confirmRemove === member.user_id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-white/10"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-white font-medium">Remove {member.username}?</p>
                                        <p className="text-xs text-white/60 mt-1">
                                            They will lose access to this workspace and all its tasks.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setConfirmRemove(null)}
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 text-sm font-medium transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleRemoveMember(member.user_id)}
                                        disabled={removingMemberId === member.user_id}
                                        className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                    >
                                        {removingMemberId === member.user_id ? 'Removing...' : 'Remove'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
}
