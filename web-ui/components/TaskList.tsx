import React from 'react';
import { Task } from '@/lib/api';
import { TaskCard } from './TaskCard';
import { Inbox } from 'lucide-react';

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
                    <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Inbox className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg">No tasks found</p>
                <p className="text-sm">Use the assistant to create one!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onComplete}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
