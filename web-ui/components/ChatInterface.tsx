import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Send, Sparkles } from 'lucide-react';
import { AIAvatar } from './AIAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { messageVariants, typingDotVariants } from '@/lib/animations';

interface ChatInterfaceProps {
    onTaskUpdate: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onTaskUpdate }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm TaskJarvis. How can I help you today?"
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [aiState, setAiState] = useState<'idle' | 'thinking' | 'responding'>('idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        }]);
        setLoading(true);
        setAiState('thinking');

        try {
            const response = await api.chat(userMessage);
            setAiState('responding');

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.response,
                    timestamp: new Date()
                }]);
                setAiState('idle');
                onTaskUpdate();
            }, 300);
        } catch (error) {
            setAiState('idle');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I encountered an error processing your request.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden relative">
            {/* Animated Border Gradient */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-breathe" />
            </div>

            {/* Header with AI Avatar */}
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm relative z-10">
                <div className="flex items-center gap-4">
                    <AIAvatar state={aiState} size="md" />
                    <div className="flex-1">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-200">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            Task Assistant
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {aiState === 'idle' && 'Ready to help'}
                            {aiState === 'thinking' && 'Thinking...'}
                            {aiState === 'responding' && 'Responding...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-slate-800/50 hover:scrollbar-thumb-blue-400/70 relative z-10">
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            variants={messageVariants}
                            initial="hidden"
                            animate="visible"
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-700/50 text-slate-200 rounded-tl-none'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap overflow-auto">{msg.content}</p>
                                {msg.timestamp && (
                                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'
                                        }`}>
                                        {formatTime(msg.timestamp)}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Enhanced Typing Indicator */}
                {loading && (
                    <motion.div
                        className="flex gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-slate-400 rounded-full"
                                        variants={typingDotVariants}
                                        initial="initial"
                                        animate="animate"
                                        transition={{ delay: i * 0.15 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50 bg-slate-800/50 relative z-10">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me to add, list, or complete tasks..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                    <motion.button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Send className="w-4 h-4" />
                    </motion.button>
                </div>
            </form>
        </div>
    );
};