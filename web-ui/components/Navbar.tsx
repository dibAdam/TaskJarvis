'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, ListTodo, Settings, Users } from 'lucide-react';
import WorkspaceSelector from './WorkspaceSelector';
import { UserProfile } from './UserProfile';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Tasks', href: '/tasks', icon: ListTodo },
        { name: 'Workspaces', href: '/workspaces', icon: Users },
        // { name: 'Settings', href: '/settings', icon: Settings }, // Future implementation
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-4 md:px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Left: Logo and Workspace Selector */}
                <div className="flex items-center gap-4 md:gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <motion.div
                            className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-xl">⚡</span>
                        </motion.div>
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400 group-hover:opacity-80 transition-opacity">
                                TaskJarvis
                            </h1>
                        </div>
                    </Link>

                    <div className="h-8 w-px bg-slate-800 hidden md:block" />

                    <div className="hidden md:block w-64">
                        <WorkspaceSelector />
                    </div>
                </div>

                {/* Center: Navigation Links */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <motion.div
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-active"
                                            className="absolute inset-0 bg-slate-800 rounded-lg"
                                            transition={{ type: 'spring', duration: 0.5 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                    </span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: User Profile & Mobile Menu Toggle */}
                <div className="flex items-center gap-4">
                    <UserProfile />
                </div>
            </div>
        </header>
    );
}
