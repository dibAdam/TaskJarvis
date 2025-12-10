'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export function LandingNav() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Testimonials', href: '#testimonials' },
    ];

    return (
        <React.Fragment>
            <motion.nav
                className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div
                    className={`
                        relative flex items-center justify-between 
                        transition-all duration-500 ease-in-out
                        ${isScrolled ? 'w-[600px] px-6 py-3 bg-[#0f0c29]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-purple-500/20' : 'w-full max-w-7xl px-6 py-4 bg-transparent'}
                    `}
                >
                    {/* Logo */}
                    <Link href="/landing">
                        <motion.div
                            className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent cursor-pointer tracking-tight"
                            whileHover={{ scale: 1.05 }}
                        >
                            TaskJarvis
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        <Link href="/register">
                            <motion.button
                                className={`
                                    px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 hidden md:block
                                    ${isScrolled ? 'bg-white text-black hover:bg-slate-200' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}
                                `}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get Started
                            </motion.button>
                        </Link>

                        <button
                            className="md:hidden p-1 text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-[#0f0c29] flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex flex-col items-center gap-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-2xl font-bold text-white"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                <button className="px-8 py-4 bg-white text-black rounded-full text-xl font-bold">
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </React.Fragment>
    );
}
