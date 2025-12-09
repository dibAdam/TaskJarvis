'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Zap, ArrowRight, Github, Chrome, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { register, login } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    // Password strength checker
    const getPasswordStrength = () => {
        if (!password) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        const levels = [
            { strength: 1, label: 'Weak', color: 'bg-red-500' },
            { strength: 2, label: 'Fair', color: 'bg-yellow-500' },
            { strength: 3, label: 'Good', color: 'bg-blue-500' },
            { strength: 4, label: 'Strong', color: 'bg-green-500' },
        ];

        return levels[strength - 1] || levels[0];
    };

    const passwordStrength = getPasswordStrength();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            // Register the user (this also logs them in and stores tokens)
            await register(email, username, password);
            // Redirect to home page
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
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
                    className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ top: '5%', right: '10%' }}
                />
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ bottom: '5%', left: '10%' }}
                />

                {/* Animated Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-size-[50px_50px]" />

                {/* Mouse Spotlight */}
                <motion.div
                    className="absolute w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
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
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-4 shadow-2xl shadow-purple-500/50"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                            boxShadow: [
                                '0 20px 60px rgba(168, 85, 247, 0.5)',
                                '0 20px 60px rgba(236, 72, 153, 0.5)',
                                '0 20px 60px rgba(168, 85, 247, 0.5)',
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
                        Join TaskJarvis
                    </h1>
                    <p className="text-slate-400">Start your productivity journey today</p>
                </motion.div>

                {/* Register Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative bg-slate-900/50 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
                >
                    {/* Animated Border Glow */}
                    <motion.div
                        className="absolute inset-0 rounded-3xl"
                        animate={{
                            background: [
                                'linear-gradient(90deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                                'linear-gradient(180deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))',
                                'linear-gradient(270deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                                'linear-gradient(360deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    <div className="relative">
                        {/* Social Register */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all text-slate-300 hover:text-white group"
                            >
                                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">GitHub</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all text-slate-300 hover:text-white group"
                            >
                                <Chrome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Google</span>
                            </motion.button>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/50" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-slate-900/50 text-slate-400">Or register with email</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Username
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-200 placeholder-slate-500 transition-all"
                                        placeholder="johndoe"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Email */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-200 placeholder-slate-500 transition-all"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-200 placeholder-slate-500 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {password && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-2"
                                    >
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength.strength
                                                        ? passwordStrength.color
                                                        : 'bg-slate-700'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            Strength: <span className="font-medium">{passwordStrength.label}</span>
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Confirm Password */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-200 placeholder-slate-500 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    {confirmPassword && password === confirmPassword && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
                                        >
                                            <Check className="w-5 h-5" />
                                        </motion.div>
                                    )}
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
                                className="w-full relative group overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400"
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
                            transition={{ delay: 0.8 }}
                            className="mt-6 text-center text-sm text-slate-400"
                        >
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-purple-400 hover:text-purple-300 font-medium transition-colors inline-flex items-center gap-1 group"
                            >
                                Sign in
                                <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Floating Particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
                        animate={{
                            y: [-20, -120],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeOut"
                        }}
                        style={{
                            left: `${15 + i * 14}%`,
                            bottom: 0,
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
}
