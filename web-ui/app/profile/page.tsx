'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Bell, Palette, Shield, LogOut, Camera, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

    // Mock user data - replace with actual user data from your auth system
    const [userData, setUserData] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: '',
        role: 'Product Manager',
        joinDate: 'January 2024',
    });

    const [preferences, setPreferences] = useState({
        notifications: true,
        emailUpdates: false,
        darkMode: true,
        language: 'English',
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.button
                                onClick={() => router.push('/')}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                whileHover={{ x: -4 }}
                            >
                                <X className="w-5 h-5" />
                                <span className="text-sm font-medium">Back to Dashboard</span>
                            </motion.button>
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
                            Account Settings
                        </h1>
                        <div className="w-32" /> {/* Spacer for centering */}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Profile Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative bg-linear-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8 overflow-hidden"
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5" />

                        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-xl">
                                    {userData.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg transition-colors"
                                >
                                    <Camera className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-3xl font-bold mb-2">{userData.name}</h2>
                                <p className="text-slate-400 mb-1">{userData.role}</p>
                                <p className="text-sm text-slate-500">Member since {userData.joinDate}</p>

                                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">
                                        Pro User
                                    </span>
                                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm border border-purple-500/20">
                                        Verified
                                    </span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                <motion.button
                                    onClick={() => setIsEditing(!isEditing)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${isEditing
                                        ? 'bg-green-600 hover:bg-green-500 text-white'
                                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                        }`}
                                >
                                    {isEditing ? (
                                        <>
                                            <Save className="w-4 h-4 inline mr-2" />
                                            Save
                                        </>
                                    ) : (
                                        'Edit Profile'
                                    )}
                                </motion.button>
                                <motion.button
                                    onClick={handleLogout}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg font-medium transition-all border border-red-500/20"
                                >
                                    <LogOut className="w-4 h-4 inline mr-2" />
                                    Logout
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-fit">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`relative px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-slate-800 rounded-lg"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-400" />
                                        Personal Information
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={userData.name}
                                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={userData.email}
                                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                                Role
                                            </label>
                                            <input
                                                type="text"
                                                value={userData.role}
                                                onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                                Member Since
                                            </label>
                                            <input
                                                type="text"
                                                value={userData.joinDate}
                                                disabled
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg opacity-50 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                {/* Notification Settings */}
                                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-blue-400" />
                                        Notifications
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { key: 'notifications', label: 'Push Notifications', description: 'Receive push notifications for task updates' },
                                            { key: 'emailUpdates', label: 'Email Updates', description: 'Get email summaries of your tasks' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                                                <div>
                                                    <p className="font-medium">{item.label}</p>
                                                    <p className="text-sm text-slate-400">{item.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => setPreferences({ ...preferences, [item.key]: !preferences[item.key as keyof typeof preferences] })}
                                                    className={`relative w-14 h-7 rounded-full transition-colors ${preferences[item.key as keyof typeof preferences] ? 'bg-blue-600' : 'bg-slate-700'
                                                        }`}
                                                >
                                                    <motion.div
                                                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                                                        animate={{
                                                            left: preferences[item.key as keyof typeof preferences] ? '32px' : '4px',
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Appearance */}
                                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-blue-400" />
                                        Appearance
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-800/30 rounded-lg border-2 border-blue-500">
                                            <div className="w-full h-24 bg-slate-950 rounded-lg mb-3 flex items-center justify-center">
                                                <span className="text-sm text-slate-400">Dark Mode</span>
                                            </div>
                                            <p className="text-sm font-medium text-center">Dark (Active)</p>
                                        </div>
                                        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 opacity-50 cursor-not-allowed">
                                            <div className="w-full h-24 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                                                <span className="text-sm text-slate-600">Light Mode</span>
                                            </div>
                                            <p className="text-sm font-medium text-center">Light (Coming Soon)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                {/* Password */}
                                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-blue-400" />
                                        Change Password
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter current password"
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Confirm new password"
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all"
                                        >
                                            Update Password
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Two-Factor Authentication */}
                                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-400" />
                                        Two-Factor Authentication
                                    </h3>
                                    <p className="text-slate-400 mb-6">
                                        Add an extra layer of security to your account by enabling two-factor authentication.
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-all"
                                    >
                                        Enable 2FA
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
