'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface TestimonialCardProps {
    quote: string;
    author: string;
    role: string;
    rating: number;
    delay: number;
}

export function TestimonialCard({ quote, author, role, rating, delay }: TestimonialCardProps) {
    return (
        <motion.div
            className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl h-full flex flex-col justify-between group hover:bg-white/10 transition-colors duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6 }}
            whileHover={{ y: -5 }}
        >
            <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5 group-hover:text-purple-500/20 transition-colors duration-300" />

            <div>
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                    {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg text-slate-300 leading-relaxed mb-8 font-light">
                    "{quote}"
                </blockquote>
            </div>

            {/* Author */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {author.charAt(0)}
                </div>
                <div>
                    <div className="font-bold text-white">{author}</div>
                    <div className="text-sm text-slate-500">{role}</div>
                </div>
            </div>
        </motion.div>
    );
}
