'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PricingCardProps {
    tier: string;
    price: string;
    period?: string;
    features: string[];
    cta: string;
    highlighted?: boolean;
    badge?: string;
    delay: number;
}

export function PricingCard({ tier, price, period, features, cta, highlighted = false, badge, delay }: PricingCardProps) {
    return (
        <motion.div
            className={`relative p-8 rounded-4xl overflow-hidden transition-all duration-500 group ${highlighted
                ? 'bg-white/10 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20'
                : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -10 }}
        >
            {/* Highlight Glow */}
            {highlighted && (
                <div className="absolute inset-0 bg-linear-to-b from-purple-500/10 to-transparent pointer-events-none" />
            )}

            {/* Badge */}
            {highlighted && badge && (
                <div className="absolute top-0 right-0 bg-linear-to-bl from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl shadow-lg">
                    {badge}
                </div>
            )}

            {/* Header */}
            <div className="mb-8 relative z-10">
                <h3 className={`text-xl font-bold mb-2 ${highlighted ? 'text-purple-400' : 'text-slate-400'}`}>
                    {tier}
                </h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tracking-tight">{price}</span>
                    {period && <span className="text-slate-500 font-medium">{period}</span>}
                </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8 relative z-10">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-300">
                        <div className={`mt-1 p-0.5 rounded-full ${highlighted ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-medium leading-relaxed">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <div className="relative z-10">
                <Link href="/register" className="block">
                    <motion.button
                        className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${highlighted
                            ? 'bg-white text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)]'
                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {cta}
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
}
