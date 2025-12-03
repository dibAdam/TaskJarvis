import React, { useState } from 'react';
import { Task } from '@/lib/api';
import { CheckCircle, Trash2, Clock } from 'lucide-react';
import { PriorityIndicator } from './PriorityIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { taskCardVariants, completionVariants } from '@/lib/animations';

interface TaskCardProps {
    task: Task;
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete }) => {
    const [isCompleting, setIsCompleting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

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

    const isOverdue = task.deadline && task.status !== 'Completed' && new Date(task.deadline) < new Date();

    return (
        <motion.div
            variants={taskCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover="hover"
            whileTap="tap"
            layout
            className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
        >
            {/* Confetti Effect */}
            <AnimatePresence>
                {showConfetti && (
                    <>
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][i % 4],
                                    top: '50%',
                                    left: '50%'
                                }}
                                initial={{ opacity: 1, scale: 0 }}
                                animate={{
                                    opacity: 0,
                                    scale: 1,
                                    x: Math.cos((i / 12) * Math.PI * 2) * 100,
                                    y: Math.sin((i / 12) * Math.PI * 2) * 100,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            <motion.div
                className="flex items-start justify-between gap-4"
                variants={completionVariants}
                animate={isCompleting ? 'complete' : 'initial'}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        {/* Priority Indicator */}
                        <PriorityIndicator
                            priority={task.priority as 'High' | 'Medium' | 'Low'}
                            size="md"
                        />

                        {/* Deadline */}
                        {task.deadline && (
                            <span className={`flex items-center text-xs font-medium ${isOverdue
                                ? 'text-red-400'
                                : 'text-slate-400'
                                }`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDeadline(task.deadline)}
                                {isOverdue && ' ⚠️'}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-2 transition-all ${task.status === 'Completed'
                        ? 'text-slate-500 line-through'
                        : 'text-slate-200'
                        }`}>
                        {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2 font-normal">
                            {task.description}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.status !== 'Completed' && (
                        <motion.button
                            onClick={handleComplete}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Complete Task"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <CheckCircle className="w-5 h-5" />
                        </motion.button>
                    )}
                    <motion.button
                        onClick={() => onDelete(task.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete Task"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Trash2 className="w-5 h-5" />
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};
