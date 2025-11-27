import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export const Settings: React.FC = () => {
    const [provider, setProvider] = useState('GEMINI');
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
                        <option value="GEMINI">Google Gemini</option>
                        <option value="OPENAI">OpenAI (GPT-4)</option>
                        <option value="ANTHROPIC">Anthropic (Claude)</option>
                        <option value="OLLAMA">Ollama (Local)</option>
                        <option value="HUGGINGFACE">HuggingFace</option>
                        <option value="MOCK">Mock (Testing)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                        Model Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g. gpt-4-turbo"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
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
