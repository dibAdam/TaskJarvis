import React, { useEffect, useState } from 'react';
import { api, AnalyticsResponse } from '@/lib/api';
import { BarChart3, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.getAnalytics();
            setData(res);
        } catch (error) {
            console.error(' analytics', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    return (
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-200">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Analytics
                </h2>
                <button
                    onClick={fetchAnalytics}
                    className={`p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 transition-colors ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {data ? (
                <div className="space-y-6">
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                            {data.stats}
                        </pre>
                    </div>

                    {data.chart_path && (
                        <div className="aspect-square w-full bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center justify-center overflow-hidden">
                            {/* Note: In a real app we'd serve this properly. For now we use the static path */}
                            <img
                                src={`http://localhost:8000${data.chart_path}?t=${Date.now()}`}
                                alt="Analytics Chart"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-slate-500 py-8">
                    Loading analytics...
                </div>
            )}
        </div>
    );
};
