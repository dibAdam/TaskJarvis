
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Task } from '@/lib/api';
import { useState } from 'react';
import { Calendar, Trash2, MoveRight } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    onUpdate: (id: number, updates: Partial<Task>) => void;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete, onEdit }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Use motion values for smooth animations without re-renders
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Transform motion values with spring physics for smooth movement
    const rotateX = useTransform(mouseY, [-100, 100], [5, -5]);
    const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
    };

    const priorityColors = {
        High: 'bg-red-500/20 text-red-400 border-red-500/30',
        Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        Low: 'bg-green-500/20 text-green-400 border-green-500/30'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.02 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.1s ease-out'
            }}
            className="relative group cursor-pointer"
        >
            {/* Card Background with Glassmorphism */}
            <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 overflow-hidden transition-all duration-300 hover:border-slate-600/50">
                {/* Animated Gradient Overlay */}
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
                    }}
                />

                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-pink-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

                {/* Content */}
                <div className="relative z-10 space-y-2 sm:space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-slate-200 font-semibold text-xs sm:text-sm line-clamp-2 flex-1 min-w-0">
                            {task.title}
                        </h3>
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium border ${priorityColors[task.priority as keyof typeof priorityColors]} shrink-0`}>
                            {task.priority}
                        </span>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <p className="text-slate-400 text-xs line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    {/* Deadline */}
                    {task.deadline && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span className="truncate">{new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                    )}

                    {/* Actions - Show on Hover */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-700/50"
                    >
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                        </motion.button>
                        <div className="flex-1" />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus = task.status === 'pending' ? 'in progress' : 'completed';
                                onUpdate(task.id, { status: nextStatus });
                            }}
                            className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                        >
                            <MoveRight className="w-3 h-3" />
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};