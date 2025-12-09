"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Copy, Check, Mail } from 'lucide-react';
import { api, InvitationToken } from '@/lib/api';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: number;
    workspaceName: string;
}

export default function InviteMemberModal({ isOpen, onClose, workspaceId, workspaceName }: InviteMemberModalProps) {
    const [email, setEmail] = useState('');
    const [invitationToken, setInvitationToken] = useState<InvitationToken | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const token = await api.inviteToWorkspace(workspaceId, email);
            setInvitationToken(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate invitation');
        } finally {
            setIsLoading(false);
        }
    };

    const getInviteLink = () => {
        if (!invitationToken) return '';
        const baseUrl = window.location.origin;
        return `${baseUrl}/workspaces/join/${invitationToken.token}`;
    };

    const handleCopyLink = async () => {
        const link = getInviteLink();
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
            setEmail('');
            setInvitationToken(null);
            setError(null);
            setCopied(false);
        }
    };

    const expiresIn = invitationToken
        ? Math.ceil((new Date(invitationToken.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative p-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl">
                                        <Mail className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Invite Members</h2>
                                        <p className="text-sm text-white/60">{workspaceName}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                {!invitationToken ? (
                                    /* Generate Invite Form */
                                    <form onSubmit={handleGenerateInvite} className="space-y-5">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                                                Email Address <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="colleague@example.com"
                                                disabled={isLoading}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 disabled:opacity-50"
                                                autoFocus
                                            />
                                            <p className="mt-2 text-xs text-white/50">
                                                We'll generate a secure invitation link for this person
                                            </p>
                                        </div>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm"
                                            >
                                                {error}
                                            </motion.div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                disabled={isLoading}
                                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 font-medium disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isLoading || !email.trim()}
                                                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
                                            >
                                                {isLoading ? 'Generating...' : 'Generate Link'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* Invitation Link Display */
                                    <div className="space-y-5">
                                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-green-300">Invitation link generated!</p>
                                                    <p className="text-xs text-green-400/70 mt-1">
                                                        Share this link with {email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-2">
                                                Invitation Link
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={getInviteLink()}
                                                    readOnly
                                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
                                                <motion.button
                                                    onClick={handleCopyLink}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-all duration-200"
                                                >
                                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                </motion.button>
                                            </div>
                                            <p className="mt-2 text-xs text-white/50">
                                                This link expires in {expiresIn} {expiresIn === 1 ? 'day' : 'days'}
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleClose}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
