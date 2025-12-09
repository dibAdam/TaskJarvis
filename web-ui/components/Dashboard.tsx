'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Task } from '@/lib/api';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { TaskCard } from '@/components/dashboardComponents/TaskCard';
import { StatCard } from '@/components/dashboardComponents/StatCard';
import { useWorkspace } from '@/contexts/WorkspaceContext';

import {
    Target,
    Zap,
    CheckCircle2,
    Clock,
    AlertCircle,
    BarChart3,
    Flame,
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

export const Dashboard: React.FC = () => {
    const { currentWorkspace } = useWorkspace();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await api.getTasks();
            // Filter tasks by workspace if one is selected
            const filteredTasks = currentWorkspace
                ? data.filter(task => task.workspace_id === currentWorkspace.id)
                : data;
            setTasks(filteredTasks);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [currentWorkspace]);

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
        inProgress: tasks.filter(t => t.status === 'in progress').length,
        highPriority: tasks.filter(t => t.priority === 'high').length
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <motion.div
                        className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
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
                                <div className={`absolute inset-0 bg-gradient-to-br ${column.gradient} rounded-2xl opacity-50`} />

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
                                    <div className={`h-0.5 sm:h-1 rounded-full bg-gradient-to-r ${column.gradient.replace('/20', '/50')}`} />
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
