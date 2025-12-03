import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { groupHeaderVariants } from '@/lib/animations';

interface TaskGroupHeaderProps {
    name: string;
    count: number;
    color: string;
    icon: string;
    defaultExpanded?: boolean;
    children: React.ReactNode;
}

export const TaskGroupHeader: React.FC<TaskGroupHeaderProps> = ({
    name,
    count,
    color,
    icon,
    defaultExpanded = true,
    children
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const colorMap: Record<string, string> = {
        red: 'rgb(239, 68, 68)',
        blue: 'rgb(59, 130, 246)',
        purple: 'rgb(168, 85, 247)',
        green: 'rgb(34, 197, 94)',
        gray: 'rgb(100, 116, 139)',
        yellow: 'rgb(251, 191, 36)'
    };

    const accentColor = colorMap[color] || colorMap.blue;

    return (
        <div className="space-y-3">
            {/* Header */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300 group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex items-center gap-3">
                    {/* Chevron Icon */}
                    <motion.div
                        variants={groupHeaderVariants}
                        animate={isExpanded ? 'expanded' : 'collapsed'}
                    >
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </motion.div>

                    {/* Group Icon */}
                    <span className="text-2xl">{icon}</span>

                    {/* Group Name */}
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: accentColor }}
                    >
                        {name}
                    </h3>

                    {/* Count Badge */}
                    <motion.span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                            backgroundColor: `${accentColor}20`,
                            borderColor: `${accentColor}40`,
                            color: accentColor
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        {count}
                    </motion.span>
                </div>

                {/* Expand/Collapse Indicator */}
                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                    {isExpanded ? 'Click to collapse' : 'Click to expand'}
                </span>
            </motion.button>

            {/* Content */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: 'auto',
                            opacity: 1,
                            transition: {
                                height: {
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 30
                                },
                                opacity: {
                                    duration: 0.2,
                                    delay: 0.1
                                }
                            }
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                                height: {
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 30
                                },
                                opacity: {
                                    duration: 0.2
                                }
                            }
                        }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-3">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
