'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CTAGroup() {
    return (
        <motion.div
            className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
        >
            {/* Primary CTA - Magnetic & Glowing */}
            <Link href="/register">
                <motion.button
                    className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-shadow duration-300 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Start Free Journey
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </motion.button>
            </Link>

            {/* Secondary CTA - Glassmorphism */}
            <motion.button
                className="group relative px-8 py-4 rounded-full font-semibold text-lg text-white overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-colors duration-300" />
                <span className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Play className="w-4 h-4 fill-current" />
                    </div>
                    Watch Demo
                </span>
            </motion.button>
        </motion.div>
    );
}
