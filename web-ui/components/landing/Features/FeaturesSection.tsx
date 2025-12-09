'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Calendar, Bell, BarChart3, Target, Globe, Zap, Shield, Sparkles } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export function FeaturesSection() {
    const features = [
        {
            icon: Bot,
            headline: 'Your Personal AI Sidekick',
            description: 'Chat naturally with TaskJarvis to create, organize, and manage tasks effortlessly. It understands context, nuance, and your personal workflow.',
            className: 'md:col-span-2',
        },
        {
            icon: Zap,
            headline: 'Lightning Fast',
            description: 'Built for speed. No loading screens, no lag.',
            className: '',
        },
        {
            icon: Calendar,
            headline: 'Intelligent Scheduling',
            description: 'AI automatically finds the perfect slots for your tasks based on your energy levels and habits.',
            className: '',
        },
        {
            icon: Target,
            headline: 'Smart Prioritization',
            description: 'Stop guessing what to do next. TaskJarvis highlights exactly what matters most right now.',
            className: 'md:col-span-2',
        },
        {
            icon: Bell,
            headline: 'Contextual Reminders',
            description: 'Get nudged at the right time and place.',
            className: '',
        },
        {
            icon: BarChart3,
            headline: 'Deep Insights',
            description: 'Visualize your productivity patterns and optimize your workflow with beautiful analytics.',
            className: 'md:col-span-2',
        },
    ];

    return (
        // Features Section with ID for navigation
        <section id="features" className="relative py-24 sm:py-32 bg-[#0f0c29] overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 tracking-tight text-white">
                        Supercharge Your <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                            Productivity Workflow
                        </span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                        Experience the future of task management. Built for those who want to achieve more, faster.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            headline={feature.headline}
                            description={feature.description}
                            delay={index * 0.1}
                            className={feature.className}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
