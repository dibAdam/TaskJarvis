'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

function WarpBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const stars = Array.from({ length: 200 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * 2,
            prevZ: Math.random() * 2
        }));

        const animate = () => {
            ctx.fillStyle = 'rgba(15, 12, 41, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            stars.forEach(star => {
                star.z -= 0.02; // Speed
                if (star.z <= 0) {
                    star.z = 2;
                    star.prevZ = 2;
                    star.x = Math.random() * canvas.width;
                    star.y = Math.random() * canvas.height;
                }

                const x = (star.x - cx) / star.z + cx;
                const y = (star.y - cy) / star.z + cy;

                const prevX = (star.x - cx) / star.prevZ + cx;
                const prevY = (star.y - cy) / star.prevZ + cy;

                star.prevZ = star.z;

                if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;

                const alpha = (2 - star.z) / 2;
                ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.stroke();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />;
}

export function FinalCTA() {
    return (
        <section className="relative py-32 overflow-hidden bg-[#0f0c29] min-h-[calc(100vh-6rem)]">
            <WarpBackground />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-[#0f0c29] via-transparent to-[#0f0c29]" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-8">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Join the revolution</span>
                    </div>

                    <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black mb-8 tracking-tight text-white">
                        Ready to <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400">
                            Go Supernova?
                        </span>
                    </h2>

                    <p className="text-xl sm:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-light">
                        Join 10,000+ pioneers who have already upgraded their brain with TaskJarvis.
                    </p>

                    <Link href="/register">
                        <motion.button
                            className="group relative px-12 py-6 bg-white text-black rounded-full font-bold text-xl shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] overflow-hidden"
                            whileHover={{ scale: 1.05, boxShadow: '0 0 80px -10px rgba(255,255,255,0.5)' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Start Free Journey
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                        </motion.button>
                    </Link>

                    <motion.div
                        className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 font-medium uppercase tracking-wider"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                    >
                        <span>✓ No credit card required</span>
                        <span>✓ Cancel anytime</span>
                        <span>✓ Free forever plan</span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
