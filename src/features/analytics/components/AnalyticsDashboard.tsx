'use client';

import { useAnalytics } from '../hooks/useAnalytics';
import { MetricsCards } from './MetricsCards';
import { LogFeed } from './LogFeed';
import { ExportActions } from './ExportActions';
import { BarChart3, PieChart, Info, RefreshCcw } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
    productionId: string;
}

export const AnalyticsDashboard = ({ productionId }: Props) => {
    const { metrics, logs, isLoading, refetchMetrics } = useAnalytics(productionId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <BarChart3 className="text-indigo-400" size={28} />
                        </div>
                        Production Insights
                    </h1>
                    <p className="text-stone-400 text-sm mt-2 max-w-lg leading-relaxed">
                        Real-time performance metrics and detailed historical logs for this production cycle.
                    </p>
                </div>

                <button
                    onClick={() => refetchMetrics()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs font-bold text-stone-400 hover:text-white hover:bg-stone-800 transition-all uppercase tracking-widest disabled:opacity-50 group"
                >
                    <RefreshCcw size={14} className={cn(isLoading && "animate-spin")} />
                    Sync Metrics
                </button>
            </div>

            {/* Metrics Overview */}
            <MetricsCards metrics={metrics} isLoading={isLoading} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Log Feed - Spans 2 columns */}
                <div className="lg:col-span-2 space-y-4">
                    <LogFeed logs={logs} isLoading={isLoading} />
                </div>

                {/* Sidebar - Spans 1 column */}
                <div className="space-y-6">
                    {/* Event Distribution Summary (Mock Visualization based on breakdown) */}
                    <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                                <PieChart size={18} />
                            </div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Event Breakdown</h2>
                        </div>

                        <div className="space-y-4">
                            {metrics?.breakdown.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                        <span className="text-stone-400">{item.eventType}</span>
                                        <span className="text-white">{item._count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800/30">
                                        <div
                                            className="h-full bg-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.3)] transition-all duration-1000"
                                            style={{ width: `${Math.min((item._count / (metrics?.totalEvents || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {!metrics?.breakdown.length && (
                                <div className="py-10 text-center text-stone-600 text-[10px] uppercase font-bold tracking-widest">
                                    No breakdown available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Export Actions */}
                    <ExportActions productionId={productionId} />

                    {/* Quick Tips / Info */}
                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
                        <div className="flex items-start gap-3">
                            <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Retention Policy</h4>
                                <p className="text-[10px] text-stone-500 leading-relaxed">
                                    Logs are kept for 90 days. For long-term archiving, use the CSV export feature before closing the production.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
