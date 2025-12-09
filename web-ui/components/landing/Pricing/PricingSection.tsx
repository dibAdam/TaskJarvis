'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PricingCard } from './PricingCard';

export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(true);

    const pricingTiers = [
        {
            tier: 'Free',
            price: '$0',
            period: '/forever',
            features: [
                'Up to 50 tasks',
                'Basic AI assistance',
                'Mobile & web access',
                'Smart reminders',
                'Calendar integration',
            ],
            cta: 'Start Free',
            highlighted: false,
        },
        {
            tier: 'Pro',
            price: isAnnual ? '$9' : '$12',
            period: '/month',
            features: [
                'Unlimited tasks',
                'Advanced AI features',
                'Priority support',
                'Custom integrations',
                'Productivity analytics',
                'Team collaboration',
            ],
            cta: 'Start 14-Day Free Trial',
            highlighted: true,
            badge: 'Most Popular'
        },
        {
            tier: 'Team',
            price: isAnnual ? '$29' : '$39',
            period: '/user/month',
            features: [
                'Everything in Pro',
                'Unlimited team members',
                'Admin dashboard',
                'Advanced security',
                'Dedicated support',
                'Custom onboarding',
            ],
            cta: 'Contact Sales',
            highlighted: false,
        },
    ];

    return (
        <section id="pricing" className="relative py-24 sm:py-32 bg-[#0f0c29] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 text-white tracking-tight">
                        Simple Pricing,{' '}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Infinite Value
                        </span>
                    </h2>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0f0c29] ${isAnnual ? 'bg-purple-600' : 'bg-slate-600'}`}
                        >
                            <motion.span
                                layout
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`${isAnnual ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white shadow-lg`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
                            Annual <span className="text-purple-400 text-xs font-bold ml-1">(Save 20%)</span>
                        </span>
                    </div>
                </motion.div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <AnimatePresence mode="wait">
                        {pricingTiers.map((tier, index) => (
                            <PricingCard
                                key={tier.tier}
                                {...tier}
                                delay={index * 0.1}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Money-Back Guarantee */}
                <motion.div
                    className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div className="text-4xl mb-4">🛡️</div>
                    <h3 className="text-2xl font-bold text-white mb-2">30-Day Money-Back Guarantee</h3>
                    <p className="text-slate-400">
                        Try TaskJarvis risk-free. If you're not amazed, we'll refund every penny.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
