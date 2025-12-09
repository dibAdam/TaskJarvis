'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

export function StorySection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <section ref={containerRef} className="relative h-[400vh] bg-[#050505]">
            <div className="sticky top-0 h-screen overflow-hidden">
                <Background progress={smoothProgress} />
                <Content progress={smoothProgress} />
            </div>
        </section>
    );
}

function Background({ progress }: { progress: MotionValue<number> }) {
    // Generate particles with random initial positions
    const [particles, setParticles] = useState<{ x: number, y: number, size: number, duration: number }[]>([]);

    useEffect(() => {
        setParticles(Array.from({ length: 60 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            duration: Math.random() * 2 + 1,
        })));
    }, []);

    const chaosOpacity = useTransform(progress, [0, 0.3], [1, 0]);
    const orderOpacity = useTransform(progress, [0.6, 1], [0, 1]);

    // Background color shift
    const bgColor = useTransform(
        progress,
        [0, 0.5, 1],
        ['#050505', '#0a0a15', '#0f0518']
    );

    return (
        <motion.div className="absolute inset-0 w-full h-full" style={{ backgroundColor: bgColor }}>
            {/* Chaos Layer */}
            <motion.div className="absolute inset-0" style={{ opacity: chaosOpacity }}>
                {particles.map((p, i) => (
                    <motion.div
                        key={`chaos-${i}`}
                        className="absolute rounded-full bg-red-500/20 blur-[1px]"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: p.size,
                            height: p.size,
                        }}
                        animate={{
                            x: [0, Math.random() * 100 - 50, 0],
                            y: [0, Math.random() * 100 - 50, 0],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/5 to-transparent mix-blend-overlay" />
            </motion.div>

            {/* Transition/Order Layer */}
            <motion.div className="absolute inset-0" style={{ opacity: orderOpacity }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050505] to-[#050505]" />
                {particles.map((p, i) => {
                    // Grid positioning for order
                    const row = Math.floor(i / 10);
                    const col = i % 10;
                    const gridX = (col + 1) * 9; // ~10% spacing
                    const gridY = (row + 1) * 15; // ~15% spacing

                    return (
                        <motion.div
                            key={`order-${i}`}
                            className="absolute rounded-full bg-cyan-400/60 blur-[2px] shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            style={{
                                left: `${gridX}%`,
                                top: `${gridY}%`,
                                width: p.size,
                                height: p.size,
                            }}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.05,
                                ease: "easeInOut",
                            }}
                        />
                    );
                })}
                {/* Connecting lines for the grid */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                    <defs>
                        <pattern id="grid" width="9%" height="15%" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="url(#lineGradient)" strokeWidth="0.5" />
                        </pattern>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
                            <stop offset="50%" stopColor="rgba(34, 211, 238, 0.5)" />
                            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </motion.div>
        </motion.div>
    );
}

function Content({ progress }: { progress: MotionValue<number> }) {
    // Opacity ranges for 3 stages
    const opacity1 = useTransform(progress, [0, 0.2, 0.3], [0, 1, 0]);
    const blur1 = useTransform(progress, [0, 0.2, 0.3], [10, 0, 10]);
    const y1 = useTransform(progress, [0, 0.2, 0.3], [50, 0, -50]);

    const opacity2 = useTransform(progress, [0.3, 0.5, 0.6], [0, 1, 0]);
    const blur2 = useTransform(progress, [0.3, 0.5, 0.6], [10, 0, 10]);
    const scale2 = useTransform(progress, [0.3, 0.5, 0.6], [0.8, 1, 1.2]);

    const opacity3 = useTransform(progress, [0.6, 0.8, 1], [0, 1, 1]);
    const y3 = useTransform(progress, [0.6, 0.8], [50, 0]);

    return (
        <div className="absolute inset-0 flex items-center justify-center px-4 pointer-events-none">
            {/* Stage 1: The Problem */}
            <motion.div
                className="absolute max-w-4xl text-center"
                style={{ opacity: opacity1, filter: useTransform(blur1, (v) => `blur(${v}px)`), y: y1 }}
            >
                <h2 className="text-4xl md:text-6xl font-bold text-slate-200 mb-6 tracking-tight">
                    The noise is <span className="text-red-400">deafening.</span>
                </h2>
                <p className="text-xl md:text-2xl text-slate-400 leading-relaxed">
                    Endless notifications. Scattered notes. <br />
                    The constant fear of forgetting something important. <br />
                    Your brain wasn't built to be a storage drive.
                </p>
            </motion.div>

            {/* Stage 2: The Realization */}
            <motion.div
                className="absolute max-w-4xl text-center"
                style={{ opacity: opacity2, filter: useTransform(blur2, (v) => `blur(${v}px)`), scale: scale2 }}
            >
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white mb-8">
                    Breathe.
                </h2>
                <p className="text-2xl md:text-3xl text-purple-200/80 font-light">
                    What if your tools worked <span className="italic text-white">with</span> your mind,<br />
                    not against it?
                </p>
            </motion.div>

            {/* Stage 3: The Solution */}
            <motion.div
                className="absolute max-w-5xl text-center"
                style={{ opacity: opacity3, y: y3 }}
            >
                <div className="mb-12 inline-block">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 blur-[60px] opacity-20 animate-pulse" />
                        <h2 className="relative text-5xl md:text-8xl font-black tracking-tighter text-white mb-2">
                            CLARITY
                        </h2>
                    </div>
                    <p className="text-cyan-400 text-lg tracking-[0.5em] uppercase font-medium">
                        Has Arrived
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left pointer-events-auto">
                    <FeatureCard
                        title="Intelligent Sorting"
                        desc="AI that understands urgency before you do."
                        delay={0}
                    />
                    <FeatureCard
                        title="Deep Focus"
                        desc="Silence the world. Amplify your output."
                        delay={0.1}
                    />
                    <FeatureCard
                        title="Adaptive Flow"
                        desc="A system that evolves with your habits."
                        delay={0.2}
                    />
                </div>
            </motion.div>
        </div>
    );
}

function FeatureCard({ title, desc, delay }: { title: string, desc: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.5, duration: 0.8 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-500/30 transition-colors group"
        >
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
        </motion.div>
    )
}
