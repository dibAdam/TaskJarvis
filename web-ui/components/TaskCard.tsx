import React, { useState } from 'react';
import { Task } from '@/lib/api';
import { CheckCircle, Trash2, Clock, MoreVertical, GripVertical, Star, Edit2 } from 'lucide-react';
import { PriorityIndicator } from './PriorityIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { taskCardVariants, completionVariants, particleVariants } from '@/lib/animations';

interface TaskCardProps {
    task: Task;
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => void;
    compact?: boolean; // New prop for compact mode
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete, onEdit, compact = false }) => {
    const [isCompleting, setIsCompleting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isStarred, setIsStarred] = useState(false);

    const handleComplete = () => {
        setIsCompleting(true);
        setShowConfetti(true);
        setTimeout(() => {
            onComplete(task.id);
        }, 600);
    };

    const formatDeadline = (deadline: string) => {
        const date = new Date(deadline);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const diffTime = taskDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        if (diffDays < 7) return `In ${diffDays} days`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isOverdue = task.deadline && task.status !== 'completed' && new Date(task.deadline) < new Date();

    // Priority-based gradient and glow colors
    const priorityStyles = {
        High: {
            gradient: 'from-red-500/10 via-transparent to-orange-500/5',
            border: 'border-red-500/30',
            glow: 'shadow-red-500/20',
            accentBorder: 'before:bg-gradient-to-b before:from-red-500 before:to-orange-500'
        },
        Medium: {
            gradient: 'from-amber-500/10 via-transparent to-yellow-500/5',
            border: 'border-amber-500/30',
            glow: 'shadow-amber-500/20',
            accentBorder: 'before:bg-gradient-to-b before:from-amber-500 before:to-yellow-500'
        },
        Low: {
            gradient: 'from-blue-500/10 via-transparent to-cyan-500/5',
            border: 'border-blue-500/30',
            glow: 'shadow-blue-500/20',
            accentBorder: 'before:bg-gradient-to-b before:from-blue-500 before:to-cyan-500'
        }
    };

    const currentPriority = task.priority as 'High' | 'Medium' | 'Low';
    const styles = priorityStyles[currentPriority] || priorityStyles.Low;

    return (
        <motion.div
            variants={taskCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover="hover"
            whileTap="tap"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            whileDrag={{
                scale: 1.05,
                rotate: 2,
                cursor: 'grabbing',
                zIndex: 50,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            layout
            className={`group relative bg-gradient-to-br ${styles.gradient} backdrop-blur-sm border ${styles.border} rounded-2xl ${compact ? 'p-3' : 'p-6'
                } transition-all duration-300 hover:shadow-2xl hover:${styles.glow} overflow-hidden cursor-grab active:cursor-grabbing
                before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-2xl ${styles.accentBorder} before:opacity-60 hover:before:opacity-100 before:transition-opacity
                ${task.status === 'completed' ? 'opacity-60' : ''}`}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))] pointer-events-none" />

            {/* Particle Burst Effect */}
            <AnimatePresence>
                {showConfetti && (
                    <>
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full z-10"
                                style={{
                                    backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e'][i % 5],
                                    top: '50%',
                                    left: '50%'
                                }}
                                custom={i}
                                variants={particleVariants}
                                initial="initial"
                                animate="animate"
                                exit={{ opacity: 0 }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            <motion.div
                className="relative z-10"
                variants={completionVariants}
                animate={isCompleting ? 'complete' : 'initial'}
            >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Drag Handle - Visual indicator */}
                        <motion.div
                            className="opacity-0 group-hover:opacity-40 transition-opacity"
                            whileHover={{ opacity: 0.7, scale: 1.1 }}
                        >
                            <GripVertical className="w-4 h-4 text-slate-400" />
                        </motion.div>

                        {/* Priority Indicator */}
                        <PriorityIndicator
                            priority={currentPriority}
                            size="lg"
                        />

                        {/* Deadline */}
                        {task.deadline && (
                            <motion.span
                                className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm ${isOverdue
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                            >
                                <Clock className="w-3 h-3 mr-1.5" />
                                {formatDeadline(task.deadline)}
                                {isOverdue && ' ⚠️'}
                            </motion.span>
                        )}
                    </div>

                    {/* Quick Actions - Visible on hover */}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                            onClick={() => setIsStarred(!isStarred)}
                            className={`p-2 rounded-lg transition-colors ${isStarred
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-yellow-400'
                                }`}
                            title="Star Task"
                            whileHover={{ scale: 1.1, rotate: isStarred ? 0 : 15 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                        </motion.button>

                        {task.status !== 'completed' && (
                            <motion.button
                                onClick={handleComplete}
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                title="Complete Task"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <CheckCircle className="w-4 h-4" />
                            </motion.button>
                        )}

                        <motion.button
                            onClick={() => onDelete(task.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Delete Task"
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Title */}
                <h3
                    className={`${compact ? 'text-base' : 'text-2xl'} font-bold ${compact ? 'mb-1' : 'mb-3'} leading-tight tracking-tight transition-all ${task.status === 'completed'
                        ? 'text-slate-500 line-through'
                        : 'text-slate-100 group-hover:text-white'
                        }`}
                >
                    {task.title}
                </h3>

                {/* Description */}
                {!compact && task.description && (
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 font-normal">
                        {task.description}
                    </p>
                )}

                {/* Footer Metadata */}
                <div className={`flex items-center gap-3 ${compact ? 'mt-2 pt-2' : 'mt-4 pt-4'} ${compact ? '' : 'border-t border-slate-700/50'}`}>
                    {/* Status Badge */}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${task.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                        {task.status}
                    </span>

                    {/* Additional metadata can go here */}
                    <div className="flex-1" />

                    {/* Edit button - always visible */}
                    <motion.button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                        }}
                        className={`relative z-10 flex items-center gap-1.5 transition-all pointer-events-auto ${compact
                            ? 'px-3 py-1.5 bg-slate-700/50 hover:bg-blue-600/30 text-slate-300 hover:text-blue-400 rounded-lg border border-slate-600/50 hover:border-blue-500/50'
                            : 'text-slate-400 hover:text-blue-400'
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Edit Task"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        {compact && <span className="text-xs font-medium">Edit</span>}
                    </motion.button>
                </div>
            </motion.div>

            {/* Overdue Pulse Animation */}
            {isOverdue && (
                <motion.div
                    className="absolute inset-0 border-2 border-red-500/30 rounded-2xl pointer-events-none"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            )}
        </motion.div>
    );
};
