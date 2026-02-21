'use client';

import { DashboardMetrics } from '../types/analytics.types';
import { Activity, Zap, MessageSquare, BarChart3, Users } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
    metrics: DashboardMetrics | undefined;
    isLoading: boolean;
}

export const MetricsCards = ({ metrics, isLoading }: Props) => {
    const cards = [
        {
            label: 'Total Events',
            value: metrics?.totalEvents ?? 0,
            icon: <Activity size={24} className="text-indigo-400" />,
            description: 'System actions triggered',
            trend: '+12%', // Mock trend for aesthetics
        },
        {
            label: 'Operator Actions',
            value: metrics?.totalOperatorActions ?? 0,
            icon: <Users size={24} className="text-emerald-400" />,
            description: 'Manual commands sent',
            trend: '+5%',
        },
        {
            label: 'Event Types',
            value: metrics?.breakdown.length ?? 0,
            icon: <BarChart3 size={24} className="text-amber-400" />,
            description: 'Distinct categories',
        },
        {
            label: 'Sync Health',
            value: '99.9%',
            icon: <Zap size={24} className="text-yellow-400" />,
            description: 'WebSocket reliability',
            trend: 'STABLE',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className="group relative p-6 bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden hover:bg-stone-800/80 transition-all duration-300"
                >
                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="flex justify-between">
                                <div className="w-12 h-12 bg-stone-800 rounded-2xl"></div>
                                <div className="w-16 h-4 bg-stone-800 rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-8 w-24 bg-stone-800 rounded"></div>
                                <div className="h-4 w-32 bg-stone-800 rounded"></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    {card.icon}
                                </div>
                                {card.trend && (
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-1 rounded-lg border",
                                        card.trend.startsWith('+')
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                                    )}>
                                        {card.trend}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.1em] mb-1">
                                    {card.label}
                                </h3>
                                <div className="text-3xl font-bold text-white tracking-tighter">
                                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                                </div>
                                <p className="text-[10px] text-stone-600 mt-2 font-medium">
                                    {card.description}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
            ))}
        </div>
    );
};
