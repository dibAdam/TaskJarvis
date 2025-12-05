'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useMotionValue, useTransform } from 'framer-motion';
import { api, Task } from '@/lib/api';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import {
    TrendingUp,
    Target,
    Zap,
    CheckCircle2,
    Clock,
    AlertCircle,
    Sparkles,
    BarChart3,
    Calendar,
    Flame,
    Edit2,
    Trash2,
    MoveRight
} from 'lucide-react';

interface KanbanColumn {
    id: string;
    title: string;
    status: string;
    color: string;
    gradient: string;
    icon: React.ReactNode;
}

const columns: KanbanColumn[] = [
    {
        id: 'todo',
        title: 'To Do',
        status: 'pending',
        color: 'blue',
        gradient: 'from-blue-500/20 to-cyan-500/20',
        icon: <Clock className="w-5 h-5" />
    },
    {
        id: 'inprogress',
        title: 'In Progress',
        status: 'in progress',
        color: 'purple',
        gradient: 'from-purple-500/20 to-pink-500/20',
        icon: <Zap className="w-5 h-5" />
    },
    {
        id: 'done',
        title: 'Done',
        status: 'completed',
        color: 'green',
        gradient: 'from-green-500/20 to-emerald-500/20',
        icon: <CheckCircle2 className="w-5 h-5" />
    }
];

interface TaskCardProps {
    task: Task;
    onUpdate: (id: number, updates: Partial<Task>) => void;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete, onEdit }) => {
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
                <div className="absolute -inset-1 bg-linear-to-r from-blue-500/0 via-purple-500/20 to-pink-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

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

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    gradient: string;
    delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, gradient, delay }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 1000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative group"
        >
            <div className={`relative bg-linear-to-br ${gradient} backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6 overflow-hidden`}>
                {/* Animated Background */}
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                        background: [
                            'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
                        ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-slate-400 text-xs sm:text-sm mb-1 truncate">{label}</p>
                        <motion.p
                            className={`text-2xl sm:text-3xl font-bold text-${color}-400`}
                            key={count}
                        >
                            {count}
                        </motion.p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-xl bg-${color}-500/20 shrink-0`}>
                        {icon}
                    </div>
                </div>

                {/* Sparkle Effect */}
                <motion.div
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Sparkles className={`w-4 h-4 text-${color}-400`} />
                </motion.div>
            </div>
        </motion.div>
    );
};

export const Dashboard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await api.getTasks();
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
        try {
            await api.updateTask(id, updates);
            fetchTasks();
        } catch (error) {
            console.error('Failed to update task', error);
        }
    };

    const handleDeleteTask = async (id: number) => {
        try {
            await api.deleteTask(id);
            fetchTasks();
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handleSaveTask = async (id: number, updates: Partial<Task>) => {
        await handleUpdateTask(id, updates);
        handleCloseModal();
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter(task => task.status === status);
    };

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        highPriority: tasks.filter(t => t.priority === 'High').length
    };

    return (
        <div className="space-y-6">
            {/* Floating Particles Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 hidden sm:block">
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
                        animate={{
                            x: [Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
                            y: [Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000), Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%'
                        }}
                    />
                ))}
            </div>

            {/* Header with Stats */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <motion.div
                        className="p-2 sm:p-3 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
                            Task Board
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm">Manage your tasks with style</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Target className="w-6 h-6 text-blue-400" />}
                        label="Total Tasks"
                        value={stats.total}
                        color="blue"
                        gradient="from-slate-800/40 to-slate-900/40"
                        delay={0}
                    />
                    <StatCard
                        icon={<Zap className="w-6 h-6 text-purple-400" />}
                        label="In Progress"
                        value={stats.inProgress}
                        color="purple"
                        gradient="from-slate-800/40 to-slate-900/40"
                        delay={0.1}
                    />
                    <StatCard
                        icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
                        label="Completed"
                        value={stats.completed}
                        color="green"
                        gradient="from-slate-800/40 to-slate-900/40"
                        delay={0.2}
                    />
                    <StatCard
                        icon={<Flame className="w-6 h-6 text-red-400" />}
                        label="High Priority"
                        value={stats.highPriority}
                        color="red"
                        gradient="from-slate-800/40 to-slate-900/40"
                        delay={0.3}
                    />
                </div>
            </motion.div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {columns.map((column, columnIndex) => {
                    const columnTasks = getTasksByStatus(column.status);

                    return (
                        <motion.div
                            key={column.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: columnIndex * 0.1 }}
                            className="relative"
                        >
                            {/* Column Container */}
                            <div className="relative bg-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-linear-to-br ${column.gradient} rounded-2xl opacity-50`} />

                                {/* Column Header */}
                                <div className="relative z-10 mb-3 sm:mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div className={`p-1.5 sm:p-2 rounded-lg bg-${column.color}-500/20 text-${column.color}-400 shrink-0`}>
                                                {column.icon}
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-slate-200 truncate">
                                                {column.title}
                                            </h3>
                                        </div>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`px-2 sm:px-3 py-1 rounded-full bg-${column.color}-500/20 text-${column.color}-400 text-xs sm:text-sm font-medium shrink-0`}
                                        >
                                            {columnTasks.length}
                                        </motion.div>
                                    </div>
                                    <div className={`h-0.5 sm:h-1 rounded-full bg-linear-to-r ${column.gradient.replace('/20', '/50')}`} />
                                </div>

                                {/* Tasks */}
                                <div className="relative z-10 space-y-2 sm:space-y-3 max-h-[250px] sm:max-h-[350px] lg:max-h-[400px] overflow-auto scrollbar-hide">
                                    <AnimatePresence>
                                        {loading ? (
                                            <div className="text-center text-slate-500 py-8">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full mx-auto"
                                                />
                                            </div>
                                        ) : columnTasks.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center text-slate-500 py-8"
                                            >
                                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No tasks here</p>
                                            </motion.div>
                                        ) : (
                                            columnTasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onUpdate={handleUpdateTask}
                                                    onDelete={handleDeleteTask}
                                                    onEdit={handleEditTask}
                                                />
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Task Detail Modal */}
            <TaskDetailModal
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
            />
        </div>
    );
};
