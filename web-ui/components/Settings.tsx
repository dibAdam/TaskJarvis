import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export const Settings: React.FC = () => {
    const [provider, setProvider] = useState('OPENROUTER');
    const [model, setModel] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.configure(provider, model || undefined);
            // Show success toast or something (omitted for brevity)
        } catch (error) {
            console.error('Failed to save settings', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-2 mb-6">
                <SettingsIcon className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-200">Settings</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                        LLM Provider
                    </label>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500/50"
                    >
                        <option value="OPENROUTER">OpenRouter (Unified AI)</option>
                        <option value="MOCK">Mock (Testing)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                        OpenRouter Model
                    </label>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500/50"
                        disabled={provider !== 'OPENROUTER'}
                    >
                        <option value="">Default (Claude 3.5 Sonnet)</option>
                        <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Best for SQL/Structured)</option>
                        <option value="openai/gpt-4o">GPT-4o (Advanced Reasoning)</option>
                        <option value="openai/gpt-4o-mini">GPT-4o Mini (Fast & Cost-Effective)</option>
                        <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B (Open Source)</option>
                        <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B (Very Cheap)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                        {provider === 'OPENROUTER' ? 'Select an AI model from OpenRouter' : 'Only available for OpenRouter provider'}
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
};