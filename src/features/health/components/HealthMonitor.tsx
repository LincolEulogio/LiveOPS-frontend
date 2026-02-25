'use client';

import React from 'react';
import { useStreamHealth, HealthStats } from '@/features/health/hooks/useStreamHealth';
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
import { Activity, Cpu, Zap, AlertCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
    productionId: string;
}

export const HealthMonitor = ({ productionId }: Props) => {
    const { lastStats, history, isHealthy } = useStreamHealth(productionId);

    if (!lastStats && history.length === 0) {
        return (
            <div className="p-10 bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-6  relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-50 blur-3xl rounded-full" />
                <Activity className="text-indigo-400/30 animate-pulse relative z-10" size={48} />
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-muted uppercase  mb-1">Scanning Signal...</p>
                    <p className="text-[9px] font-bold text-muted/60 uppercase  leading-loose">Waiting for telemetry downlink</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] overflow-hidden flex flex-col  relative">
            {/* Visual Scanline Effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse" />

            {/* Header */}
            <div className="p-6 border-b border-card-border/50 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                        isHealthy ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
                    )}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-foreground uppercase  leading-none mb-1.5">Stream Integrity</h2>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", isHealthy ? "bg-emerald-500" : "bg-red-500 animate-ping")} />
                            <span className="text-[9px] font-black text-muted uppercase ">Real-time Telemetry</span>
                        </div>
                    </div>
                </div>
                <div className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase  border transition-all ",
                    isHealthy
                        ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30"
                        : "bg-red-600 text-white border-red-500  animate-pulse"
                )}>
                    {isHealthy ? "Operational" : "Degraded"}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background/40 backdrop-blur-md border border-card-border/60 p-5 rounded-[1.5rem]  relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            <Cpu size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-muted uppercase ">Engine CPU Load</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
                    </div>
                    <p className="text-3xl font-black text-foreground er relative z-10">
                        {lastStats?.cpuUsage !== undefined ? lastStats.cpuUsage.toFixed(1) : '--'}
                        <span className="text-sm font-bold text-muted ml-1">%</span>
                    </p>
                    {/* Tiny background graph hint */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-all" />
                </div>

                <div className="bg-background/40 backdrop-blur-md border border-card-border/60 p-5 rounded-[1.5rem]  relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-amber-400" />
                            <span className="text-[10px] font-black text-muted uppercase ">Effective Cadence</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20 group-hover:bg-amber-500 transition-colors" />
                    </div>
                    <p className="text-3xl font-black text-foreground er relative z-10">
                        {lastStats?.fps !== undefined ? lastStats.fps.toFixed(0) : '--'}
                        <span className="text-sm font-bold text-muted ml-1">FPS</span>
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/10 group-hover:bg-amber-500/20 transition-all" />
                </div>
            </div>

            {/* Tactical Chart Surface */}
            <div className="h-48 w-full px-4 pb-6 mt-2">
                <div className="w-full h-full bg-black/20 rounded-[1.5rem] border border-white/5 p-4  relative">
                    <div className="absolute top-3 left-6 flex items-center gap-2 opacity-30">
                        <Activity size={10} className="text-indigo-400" />
                        <span className="text-[8px] font-black uppercase ">Historical Flux</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    backdropFilter: 'blur(10px)',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                                itemStyle={{ color: '#818cf8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="cpuUsage"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCpu)"
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Urgent Alerts Hub */}
            {lastStats && lastStats.skippedFrames > 0 && (
                <div className="mx-6 mb-6 p-4 bg-red-600 border border-red-500 rounded-[1.5rem] flex items-center gap-4 animate-pulse  ">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <AlertCircle size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-white uppercase ">Packet Loss Detected</p>
                        <p className="text-[9px] font-bold text-white/80 uppercase ">{lastStats.skippedFrames} frames dropped in current cycle.</p>
                    </div>
                </div>
            )}

            {/* Status Footer */}
            <div className="p-4 bg-white/5 border-t border-card-border/30 flex justify-center">
                <div className="flex items-center gap-2 opacity-40 group cursor-default">
                    <ShieldCheck size={12} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase  group-hover:text-foreground transition-colors">Encrypted Uplink Certified</span>
                </div>
            </div>
        </div>
    );
};
