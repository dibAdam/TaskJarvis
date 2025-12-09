'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, Zap, ArrowRight, Github, Chrome } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4"
            onMouseMove={handleMouseMove}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs */}
                <motion.div
                    className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ top: '10%', left: '10%' }}
                />
                <motion.div
                    className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ bottom: '10%', right: '10%' }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-size-[50px_50px]" />

                {/* Spotlight Effect */}
                <motion.div
                    className="absolute w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"
                    animate={{
                        x: mousePosition.x - 192,
                        y: mousePosition.y - 192,
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                />
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo & Title */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-2xl shadow-blue-500/50"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Zap className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400">Sign in to continue your journey</p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative bg-slate-900/50 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
                >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl" />

                    <div className="relative">
                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all text-slate-300 hover:text-white"
                            >
                                <Github className="w-5 h-5" />
                                <span className="text-sm font-medium">GitHub</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all text-slate-300 hover:text-white"
                            >
                                <Chrome className="w-5 h-5" />
                                <span className="text-sm font-medium">Google</span>
                            </motion.button>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/50" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-slate-900/50 text-slate-400">Or continue with email</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-200 placeholder-slate-500 transition-all"
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                        aria-label="Email address"
                                        aria-required="true"
                                    />
                                </div>
                            </motion.div>

                            {/* Password Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-200 placeholder-slate-500 transition-all"
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        aria-label="Password"
                                        aria-required="true"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full relative group overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.5 }}
                                />
                            </motion.button>
                        </form>

                        {/* Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 text-center text-sm text-slate-400"
                        >
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors inline-flex items-center gap-1 group"
                            >
                                Sign up
                                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Floating Particles */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                        animate={{
                            y: [-20, -100],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.6,
                            ease: "easeOut"
                        }}
                        style={{
                            left: `${20 + i * 15}%`,
                            bottom: 0,
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
}
