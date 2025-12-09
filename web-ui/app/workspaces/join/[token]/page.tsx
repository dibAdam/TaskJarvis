"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function JoinWorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [isJoining, setIsJoining] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [workspaceId, setWorkspaceId] = useState<number | null>(null);

    useEffect(() => {
        if (token) {
            handleJoinWorkspace();
        }
    }, [token]);

    const handleJoinWorkspace = async () => {
        try {
            setIsJoining(true);
            setError(null);

            const result = await api.joinWorkspace(token);
            setWorkspaceId(result.workspace_id);
            setSuccess(true);

            // Redirect to workspace after 2 seconds
            setTimeout(() => {
                router.push(`/workspaces/${result.workspace_id}`);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join workspace');
            setSuccess(false);
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
            >
                {isJoining && (
                    <>
                        <div className="mb-6">
                            <div className="inline-flex p-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl mb-4">
                                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Joining Workspace</h1>
                        <p className="text-white/60">Please wait while we add you to the workspace...</p>
                    </>
                )}

                {!isJoining && success && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="mb-6"
                        >
                            <div className="inline-flex p-4 bg-green-500/20 border border-green-500/30 rounded-2xl mb-4">
                                <CheckCircle className="w-12 h-12 text-green-400" />
                            </div>
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome!</h1>
                        <p className="text-white/60 mb-6">
                            You've successfully joined the workspace. Redirecting you now...
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Redirecting...</span>
                        </div>
                    </>
                )}

                {!isJoining && error && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="mb-6"
                        >
                            <div className="inline-flex p-4 bg-red-500/20 border border-red-500/30 rounded-2xl mb-4">
                                <XCircle className="w-12 h-12 text-red-400" />
                            </div>
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Failed to Join</h1>
                        <p className="text-white/60 mb-6">{error}</p>
                        <div className="space-y-3">
                            <button
                                onClick={handleJoinWorkspace}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push('/workspaces')}
                                className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                            >
                                Go to Workspaces
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
