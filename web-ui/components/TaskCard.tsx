import React from 'react';
import { Task } from '@/lib/api';
import { CheckCircle, Trash2, Clock, AlertCircle } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete }) => {
    const priorityColors = {
        High: 'bg-red-500/10 text-red-400 border-red-500/20',
        Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };

    const priorityColor = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.Medium;

    return (
        <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColor}`}>
                            {task.priority}
                        </span>
                        {task.deadline && (
                            <span className="flex items-center text-xs text-slate-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {task.deadline}
                            </span>
                        )}
                    </div>

                    <h3 className={`text-lg font-medium ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {task.title}
                    </h3>

                    {task.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.status !== 'Completed' && (
                        <button
                            onClick={() => onComplete(task.id)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Complete Task"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete Task"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
