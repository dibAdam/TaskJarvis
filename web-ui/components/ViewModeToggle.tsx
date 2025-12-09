import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, List, Columns3, Calendar } from 'lucide-react';

export type ViewMode = 'grid' | 'list' | 'kanban' | 'calendar';

interface ViewModeToggleProps {
    currentMode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ currentMode, onModeChange }) => {
    const modes: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
        { id: 'grid', icon: <LayoutGrid className="w-4 h-4" />, label: 'Grid' },
        { id: 'list', icon: <List className="w-4 h-4" />, label: 'List' },
        { id: 'kanban', icon: <Columns3 className="w-4 h-4" />, label: 'Board' },
        { id: 'calendar', icon: <Calendar className="w-4 h-4" />, label: 'Calendar' }
    ];

    return (
        <div className="flex items-center gap-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-xl p-1.5">
            {modes.map((mode) => (
                <motion.button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentMode === mode.id
                            ? 'text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={mode.label}
                >
                    {/* Active Background */}
                    {currentMode === mode.id && (
                        <motion.div
                            layoutId="activeMode"
                            className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-600/80 rounded-lg shadow-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                    )}

                    {/* Icon */}
                    <span className="relative z-10">{mode.icon}</span>

                    {/* Label - Hidden on mobile */}
                    <span className="relative z-10 hidden sm:inline">{mode.label}</span>
                </motion.button>
            ))}
        </div>
    );
};
