'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TestimonialCard } from './TestimonialCard';

export function TestimonialsSection() {
    const testimonials = [
        {
            quote: "TaskJarvis completely changed how I work. I went from overwhelmed to organized in days. The AI is scary good at predicting what I need.",
            author: "Sarah Chen",
            role: "Product Manager @ TechCorp",
            rating: 5,
        },
        {
            quote: "I've tried every productivity app out there. TaskJarvis is the only one that actually feels intelligent. It's like having a personal assistant.",
            author: "Marcus Rodriguez",
            role: "Entrepreneur",
            rating: 5,
        },
        {
            quote: "The design is stunning, and the AI features are next-level. TaskJarvis makes productivity feel effortless and even enjoyable.",
            author: "Emily Watson",
            role: "Creative Director",
            rating: 5,
        },
        {
            quote: "As someone with ADHD, task management has always been a struggle. TaskJarvis finally makes it work for my brain.",
            author: "Alex Kim",
            role: "Software Engineer",
            rating: 5,
        },
        {
            quote: "The automated scheduling feature alone is worth the price. It saves me hours every week.",
            author: "David Park",
            role: "Freelance Designer",
            rating: 5,
        },
        {
            quote: "Finally, a tool that understands context. It knows when I'm in 'deep work' mode and doesn't disturb me.",
            author: "Lisa Wang",
            role: "Writer",
            rating: 5,
        },
    ];

    return (
        <section id="testimonials" className="relative py-24 sm:py-32 bg-[#0a0a0f] overflow-hidden min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                {/* Section Title */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 text-white tracking-tight">
                        Loved by{' '}
                        <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Thousands
                        </span>
                    </h2>
                </motion.div>
            </div>

            {/* Infinite Marquee */}
            <div className="relative flex overflow-hidden py-8">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-[#0a0a0f] to-transparent z-10" />

                <motion.div
                    className="flex gap-8 px-8"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 40,
                    }}
                >
                    {[...testimonials, ...testimonials].map((testimonial, index) => (
                        <div key={index} className="w-[400px] shrink-0">
                            <TestimonialCard {...testimonial} delay={0} />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Trust Badges */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400 font-medium uppercase tracking-wider"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                        ⭐ Featured on Product Hunt
                    </div>
                    <div className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                        🏆 #1 Productivity App 2024
                    </div>
                    <div className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                        🔒 SOC 2 Compliant
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
