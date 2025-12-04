import React from 'react';
import { motion } from 'framer-motion';
import { priorityGlowVariants } from '@/lib/animations';

interface PriorityIndicatorProps {
    priority: 'High' | 'Medium' | 'Low';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
    priority,
    size = 'md',
    showLabel = false
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const config = {
        High: {
            shape: 'circle',
            color: 'rgb(248, 113, 113)',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            icon: '🔴',
            label: 'High Priority'
        },
        Medium: {
            shape: 'circle',
            color: 'rgb(252, 211, 77)',
            bgColor: 'rgba(251, 191, 36, 0.1)',
            borderColor: 'rgba(251, 191, 36, 0.3)',
            icon: '🟡',
            label: 'Medium Priority'
        },
        Low: {
            shape: 'circle',
            color: 'rgb(96, 165, 250)',
            bgColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            icon: '🟢',
            label: 'Low Priority'
        },
        // Lowercase versions for backend compatibility
        high: {
            shape: 'circle',
            color: 'rgb(248, 113, 113)',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            icon: '🔴',
            label: 'High Priority'
        },
        medium: {
            shape: 'circle',
            color: 'rgb(252, 211, 77)',
            bgColor: 'rgba(251, 191, 36, 0.1)',
            borderColor: 'rgba(251, 191, 36, 0.3)',
            icon: '🟡',
            label: 'Medium Priority'
        },
        low: {
            shape: 'circle',
            color: 'rgb(96, 165, 250)',
            bgColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            icon: '🟢',
            label: 'Low Priority'
        }
    };

    // Normalize priority value and provide fallback
    const normalizedPriority = (priority in config) ? priority : 'medium';
    const { shape, color, bgColor, borderColor, icon, label } = config[normalizedPriority];

    const renderShape = () => {
        if (shape === 'circle') {
            return (
                <motion.div
                    className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-2`}
                    style={{
                        backgroundColor: bgColor,
                        borderColor: borderColor,
                        color: color
                    }}
                    variants={priorityGlowVariants}
                    animate={normalizedPriority.toLowerCase() as 'high' | 'medium' | 'low'}
                    title={label}
                >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                </motion.div>
            );
        }

        if (shape === 'triangle') {
            return (
                <motion.div
                    className={`${sizeClasses[size]} flex items-center justify-center rounded-sm`}
                    variants={priorityGlowVariants}
                    animate="medium"
                    title={label}
                >
                    <div
                        className="w-0 h-0"
                        style={{
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderBottom: `17.32px solid ${color}`,
                            filter: `drop-shadow(0 0 8px ${borderColor})`
                        }}
                    />
                </motion.div>
            );
        }

        // Square
        return (
            <motion.div
                className={`${sizeClasses[size]} rounded-md flex items-center justify-center border-2`}
                style={{
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    color: color
                }}
                variants={priorityGlowVariants}
                animate="low"
                title={label}
            >
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
            </motion.div>
        );
    };

    return (
        <div className="flex items-center gap-2">
            {renderShape()}
            {showLabel && (
                <span className="text-sm font-medium" style={{ color }}>
                    {normalizedPriority}
                </span>
            )}
        </div>
    );
};
