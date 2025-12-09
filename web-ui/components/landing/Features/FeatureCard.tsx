'use client';

import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    headline: string;
    description: string;
    delay: number;
    className?: string;
}

export function FeatureCard({ icon: Icon, headline, description, delay, className = "" }: FeatureCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            ref={ref}
            className={`group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden ${className}`}
            onMouseMove={onMouseMove}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay, duration: 0.5 }}
        >
            {/* Hover Highlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            rgba(147, 51, 234, 0.15),
                            transparent 80%
                        )
                    `,
                }}
            />

            {/* Border Highlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            rgba(147, 51, 234, 0.5),
                            transparent 80%
                        )
                    `,
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                <div className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                    {headline}
                </h3>

                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}
