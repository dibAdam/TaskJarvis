'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HeroBackground } from './HeroBackground';
import { AnimatedHeadline } from './AnimatedHeadline';
import { CTAGroup } from './CTAGroup';

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0f0c29]">
            {/* Immersive Background */}
            <HeroBackground />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center justify-center min-h-screen">

                {/* Animated Headline */}
                <div className="mb-8">
                    <AnimatedHeadline />
                </div>

                {/* Subheading */}
                <motion.p
                    className="mt-6 text-xl sm:text-2xl md:text-3xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light tracking-wide"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
                >
                    TaskJarvis transforms chaos into clarity. Intelligent task management that <span className="text-purple-400 font-semibold">thinks ahead</span>, adapts to you, and gets things done—automatically.
                </motion.p>

                {/* CTA Buttons */}
                <div className="mt-12 w-full flex justify-center">
                    <CTAGroup />
                </div>

                {/* Trust Signals */}
                <motion.div
                    className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm sm:text-base text-slate-400 font-medium tracking-wider uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.8 }}
                >
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                        ✓ Free forever plan
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                        ✓ No credit card required
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                        ✓ Setup in 2 minutes
                    </span>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{
                    opacity: { delay: 2.5, duration: 0.6 },
                    y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                }}
            >
                <span className="text-xs tracking-[0.2em] text-slate-500 uppercase">Scroll to Explore</span>
                <ChevronDown className="w-6 h-6 text-purple-400" />
            </motion.div>
        </section>
    );
}
