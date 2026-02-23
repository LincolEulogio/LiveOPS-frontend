'use client';

import React from 'react';
import { useStreamHealth, HealthStats } from '../hooks/useStreamHealth';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Activity, Cpu, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
    productionId: string;
}

export const HealthMonitor = ({ productionId }: Props) => {
    const { lastStats, history, isHealthy } = useStreamHealth(productionId);

    if (!lastStats && history.length === 0) {
        return (
            <div className="p-6 bg-stone-900/50 border border-stone-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
                <Activity className="text-stone-700 animate-pulse" size={32} />
                <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Esperando telemetría...</p>
            </div>
        );
    }

    return (
        <div className="bg-stone-900/50 border border-stone-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-stone-800 bg-stone-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity size={16} className={cn(isHealthy ? "text-emerald-400" : "text-amber-400 animate-pulse")} />
                    <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Estado del Stream</h2>
                </div>
                <div className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                    isHealthy ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                )}>
                    {isHealthy ? "Estable" : "Crítico"}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
                <div className="bg-stone-950/40 border border-stone-800 p-3 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Cpu size={12} className="text-indigo-400" />
                        <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">CPU Engine</span>
                    </div>
                    <p className="text-xl font-black text-white">
                        {lastStats?.cpuUsage !== undefined ? lastStats.cpuUsage.toFixed(1) : '--'}%
                    </p>
                </div>
                <div className="bg-stone-950/40 border border-stone-800 p-3 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={12} className="text-amber-400" />
                        <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">FPS Reales</span>
                    </div>
                    <p className="text-xl font-black text-white">
                        {lastStats?.fps !== undefined ? lastStats.fps.toFixed(0) : '--'}
                    </p>
                </div>
            </div>

            {/* CPU Chart */}
            <div className="h-32 w-full px-2 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0c0a09', border: '1px solid #292524', borderRadius: '8px', fontSize: '10px' }}
                            itemStyle={{ color: '#818cf8' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cpuUsage"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorCpu)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Frame Loss Indicator */}
            {lastStats && lastStats.skippedFrames > 0 && (
                <div className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-pulse">
                    <AlertCircle size={16} className="text-red-400" />
                    <div>
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Pérdida de Frames</p>
                        <p className="text-[8px] font-bold text-red-300">Se han detectado {lastStats.skippedFrames} frames caídos.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
