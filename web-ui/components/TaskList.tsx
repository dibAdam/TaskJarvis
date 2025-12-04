import React, { useState, useEffect } from 'react';
import { Task } from '@/lib/api';
import { TaskCard } from './TaskCard';
import { TaskGroupHeader } from './TaskGroupHeader';
import { TaskDetailModal } from './TaskDetailModal';
import { ViewModeToggle, ViewMode } from './ViewModeToggle';
import { CalendarView } from './CalendarView';
import { Inbox, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { groupTasksByTime, sortTasksWithinGroup } from '@/lib/taskGrouping';
import { groupContainerVariants } from '@/lib/animations';

interface TaskListProps {
    tasks: Task[];
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdate: (id: number, updates: Partial<Task>) => void;
    loading: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete, onDelete, onUpdate, loading }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSaveTask = (id: number, updates: Partial<Task>) => {
        onUpdate(id, updates);
        handleCloseModal();
    };

    // Load saved view mode from localStorage
    useEffect(() => {
        const savedMode = localStorage.getItem('taskViewMode') as ViewMode;
        if (savedMode) {
            setViewMode(savedMode);
        }
    }, []);

    // Save view mode to localStorage
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('taskViewMode', mode);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center py-20 text-slate-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Inbox className="w-20 h-20 mb-6 opacity-50" />
                <p className="text-2xl font-bold mb-2">No tasks found</p>
                <p className="text-sm text-slate-400">Use the assistant to create your first task!</p>
            </motion.div>
        );
    }

    // Group tasks by time period
    const taskGroups = groupTasksByTime(tasks);

    // Grid layout classes based on view mode
    const gridClasses = {
        grid: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
        list: 'flex flex-col gap-3',
        kanban: 'grid grid-cols-1 md:grid-cols-3 gap-4',
        calendar: 'grid grid-cols-1 gap-4' // Not used, calendar has its own layout
    };

    // If calendar view, render CalendarView component
    if (viewMode === 'calendar') {
        return (
            <div className="space-y-6">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-200">Tasks</h2>
                        <span className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50">
                            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ViewModeToggle currentMode={viewMode} onModeChange={handleViewModeChange} />
                    </div>
                </div>

                {/* Calendar View */}
                <CalendarView
                    tasks={tasks}
                    onTaskClick={handleEditTask}
                    onComplete={onComplete}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                />

                {/* Task Detail Modal */}
                <TaskDetailModal
                    task={editingTask}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveTask}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-200">Tasks</h2>
                    <span className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50">
                        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <ViewModeToggle currentMode={viewMode} onModeChange={handleViewModeChange} />
                </div>
            </div>

            {/* Task Groups */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                >
                    {taskGroups.map((group) => {
                        // Don't show empty groups except Completed
                        if (group.tasks.length === 0 && group.name !== 'Completed') {
                            return null;
                        }

                        // Sort tasks within each group
                        const sortedTasks = sortTasksWithinGroup(group.tasks);

                        // Don't show completed group if empty
                        if (group.name === 'Completed' && sortedTasks.length === 0) {
                            return null;
                        }

                        return (
                            <TaskGroupHeader
                                key={group.name}
                                name={group.name}
                                count={sortedTasks.length}
                                color={group.color}
                                icon={group.icon}
                                defaultExpanded={group.name !== 'Completed'}
                            >
                                <motion.div
                                    variants={groupContainerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className={gridClasses[viewMode]}
                                >
                                    <AnimatePresence mode="popLayout">
                                        {sortedTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onComplete={onComplete}
                                                onDelete={onDelete}
                                                onEdit={handleEditTask}
                                                compact={true}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </TaskGroupHeader>
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            {/* Task Detail Modal */}
            <TaskDetailModal
                task={editingTask}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
            />
        </div>
    );
};
