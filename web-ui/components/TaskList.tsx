import React from 'react';
import { Task } from '@/lib/api';
import { TaskCard } from './TaskCard';
import { TaskGroupHeader } from './TaskGroupHeader';
import { Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { groupTasksByTime, sortTasksWithinGroup } from '@/lib/taskGrouping';
import { groupContainerVariants } from '@/lib/animations';

interface TaskListProps {
    tasks: Task[];
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    loading: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete, onDelete, loading }) => {
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
                className="flex flex-col items-center justify-center py-16 text-slate-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Inbox className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-xl font-semibold">No tasks found</p>
                <p className="text-sm mt-2">Use the assistant to create one!</p>
            </motion.div>
        );
    }

    // Group tasks by time period
    const taskGroups = groupTasksByTime(tasks);

    return (
        <div className="space-y-6">
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
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                        >
                            <AnimatePresence mode="popLayout">
                                {sortedTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onComplete={onComplete}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </TaskGroupHeader>
                );
            })}
        </div>
    );
};
