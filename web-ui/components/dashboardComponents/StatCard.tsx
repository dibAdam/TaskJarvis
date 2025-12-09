import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    gradient: string;
    delay: number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, gradient, delay }) => {
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
            <div className={`relative bg-gradient-to-br ${gradient} backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6 overflow-hidden`}>
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