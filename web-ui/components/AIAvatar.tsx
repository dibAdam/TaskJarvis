import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { avatarVariants, glowVariants } from '@/lib/animations';

interface AIAvatarProps {
    state?: 'idle' | 'thinking' | 'responding';
    size?: 'sm' | 'md' | 'lg';
}

export const AIAvatar: React.FC<AIAvatarProps> = ({
    state = 'idle',
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    };

    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* Glow Effect */}
            <motion.div
                className={`absolute ${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl`}
                variants={glowVariants}
                animate={state}
            />

            {/* Avatar Container */}
            <motion.div
                className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg`}
                variants={avatarVariants}
                animate={state}
            >
                {/* Icon */}
                {state === 'thinking' ? (
                    <Sparkles className={`${iconSizes[size]} text-white`} />
                ) : (
                    <Bot className={`${iconSizes[size]} text-white`} />
                )}

                {/* Thinking Particles */}
                {state === 'thinking' && (
                    <>
                        <motion.div
                            className="absolute w-2 h-2 rounded-full bg-white"
                            animate={{
                                x: [0, 10, 0],
                                y: [0, -10, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                            style={{ top: '20%', right: '20%' }}
                        />
                        <motion.div
                            className="absolute w-1.5 h-1.5 rounded-full bg-white"
                            animate={{
                                x: [0, -8, 0],
                                y: [0, -12, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.3
                            }}
                            style={{ top: '30%', left: '25%' }}
                        />
                        <motion.div
                            className="absolute w-1 h-1 rounded-full bg-white"
                            animate={{
                                x: [0, 5, 0],
                                y: [0, -15, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.6
                            }}
                            style={{ top: '25%', right: '30%' }}
                        />
                    </>
                )}

                {/* Status Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/30"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            </motion.div>

            {/* Status Indicator Dot */}
            <motion.div
                className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900"
                style={{
                    backgroundColor: state === 'idle' ? '#10b981' : state === 'thinking' ? '#f59e0b' : '#3b82f6'
                }}
                animate={{
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />
        </div>
    );
};