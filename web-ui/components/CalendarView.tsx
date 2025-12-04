import React, { useState } from 'react';
import { Task } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PriorityIndicator } from './PriorityIndicator';
import { TaskCard } from './TaskCard';

interface CalendarViewProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdate: (id: number, updates: Partial<Task>) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    tasks,
    onTaskClick,
    onComplete,
    onDelete,
    onUpdate
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<{ day: number; tasks: Task[] } | null>(null);

    // Get calendar data
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Month navigation
    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(null);
    };

    // Get tasks for a specific date
    const getTasksForDate = (day: number) => {
        return tasks.filter(task => {
            if (!task.deadline) return false;

            // Parse the task deadline
            const taskDate = new Date(task.deadline);

            // Compare year, month, and day
            return taskDate.getFullYear() === year &&
                taskDate.getMonth() === month &&
                taskDate.getDate() === day;
        });
    };

    // Check if date is today
    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    // Handle day click
    const handleDayClick = (day: number, dayTasks: Task[]) => {
        if (dayTasks.length > 3) {
            setSelectedDate({ day, tasks: dayTasks });
        }
    };

    // Generate calendar days
    const calendarDays = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="min-h-[120px] bg-slate-900/20" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayTasks = getTasksForDate(day);
        const today = isToday(day);
        const hasMoreTasks = dayTasks.length > 3;

        calendarDays.push(
            <motion.div
                key={day}
                className={`min-h-[120px] p-2 border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors ${today ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''
                    } ${hasMoreTasks ? 'cursor-pointer' : ''}`}
                whileHover={{ scale: hasMoreTasks ? 1.02 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => handleDayClick(day, dayTasks)}
            >
                {/* Day number */}
                <div className={`text-sm font-semibold mb-2 ${today ? 'text-blue-400' : 'text-slate-300'}`}>
                    {day}
                </div>

                {/* Tasks for this day */}
                <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                        <motion.div
                            key={task.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onTaskClick(task);
                            }}
                            className={`text-xs p-1.5 rounded cursor-pointer flex items-center gap-1.5 ${task.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300 line-through'
                                : task.priority === 'High' || task.priority === 'high'
                                    ? 'bg-red-500/20 text-red-300 border-l-2 border-red-500'
                                    : task.priority === 'Medium' || task.priority === 'medium'
                                        ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-500'
                                        : 'bg-blue-500/20 text-blue-300 border-l-2 border-blue-500'
                                }`}
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <PriorityIndicator
                                priority={task.priority as 'High' | 'Medium' | 'Low'}
                                size="sm"
                            />
                            <span className="truncate flex-1">{task.title}</span>
                        </motion.div>
                    ))}

                    {/* Show "+X more" if there are more tasks */}
                    {hasMoreTasks && (
                        <motion.div
                            className="text-xs text-blue-400 pl-1.5 font-medium hover:text-blue-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                        >
                            +{dayTasks.length - 3} more (click to view)
                        </motion.div>
                    )}
                </div>
            </motion.div>
        );
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-100">
                        {monthNames[month]} {year}
                    </h2>
                    <motion.button
                        onClick={goToToday}
                        className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium border border-blue-500/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Today
                    </motion.button>
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        onClick={previousMonth}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        onClick={nextMonth}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/60 rounded-xl overflow-hidden">
                {/* Day names header */}
                <div className="grid grid-cols-7 bg-slate-800/60">
                    {dayNames.map(day => (
                        <div
                            key={day}
                            className="p-3 text-center text-sm font-semibold text-slate-400 border-b border-slate-700/50"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                    {calendarDays}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs text-slate-400 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/20 border-l-2 border-red-500 rounded-sm" />
                    <span>High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500/20 border-l-2 border-amber-500 rounded-sm" />
                    <span>Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500/20 border-l-2 border-blue-500 rounded-sm" />
                    <span>Low Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500/20 rounded-sm" />
                    <span>Completed</span>
                </div>
            </div>

            {/* Expanded Day View Modal */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedDate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-200">
                                        {monthNames[month]} {selectedDate.day}, {year}
                                    </h3>
                                    <p className="text-slate-400 mt-1">
                                        {selectedDate.tasks.length} {selectedDate.tasks.length === 1 ? 'task' : 'tasks'}
                                    </p>
                                </div>
                                <motion.button
                                    onClick={() => setSelectedDate(null)}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </motion.button>
                            </div>

                            {/* Modal Content - Scrollable Task List */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
                                <div className="space-y-4">
                                    {selectedDate.tasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onComplete={onComplete}
                                            onDelete={onDelete}
                                            onEdit={onTaskClick}
                                            compact={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
