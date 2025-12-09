'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedHeadline() {
    const text = "Organize Your Life at the Speed of Thought";
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const child = {
        hidden: { opacity: 0, y: 50, rotateX: -90 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <div className="perspective-1000">
            <motion.h1
                className="text-5xl sm:text-6xl lg:text-8xl font-black leading-tight tracking-tight"
                variants={container}
                initial="hidden"
                animate="visible"
            >
                {words.map((word, index) => (
                    <motion.span
                        key={index}
                        variants={child}
                        className="inline-block mr-4 sm:mr-6 bg-clip-text text-transparent bg-linear-to-r from-blue-800/60 to-purple-500 animate-gradient-x"
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.h1>
        </div>
    );
}
