"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Workspace } from '@/lib/api';
import { Users, Crown, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkspaceCardProps {
    workspace: Workspace;
    isOwner: boolean;
}

export default function WorkspaceCard({ workspace, isOwner }: WorkspaceCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/workspaces/${workspace.id}`);
    };

    return (
        <motion.div
            onClick={handleClick}
            className="group relative bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer overflow-hidden"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-2xl" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {workspace.name}
                            </h3>
                        </div>
                    </div>

                    {isOwner && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
                        >
                            <Crown className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-xs font-medium text-yellow-300">Owner</span>
                        </motion.div>
                    )}
                </div>

                {/* Description */}
                {workspace.description && (
                    <p className="text-sm text-white/60 mb-4 line-clamp-2 group-hover:text-white/70 transition-colors">
                        {workspace.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-white/50">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                            {workspace.member_count || 0} {workspace.member_count === 1 ? 'member' : 'members'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-white/50">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                            {new Date(workspace.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Shine effect on hover */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                }}
            />
        </motion.div>
    );
}
