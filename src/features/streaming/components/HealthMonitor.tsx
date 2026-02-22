'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import {
    Activity, Zap, Cpu,
    BarChart3, AlertTriangle,
    CheckCircle2, Info
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { cn } from '@/shared/utils/cn';

interface HealthStats {
    productionId: string;
    engineType: string;
    cpuUsage: number;
    fps: number;
    bitrate: number;
    skippedFrames: number;
    totalFrames: number;
    memoryUsage?: number;
    timestamp: string;
}

interface HealthMonitorProps {
    productionId: string;
}

export const HealthMonitor = ({ productionId }: HealthMonitorProps) => {
    const { socket, isConnected } = useSocket();
    const [history, setHistory] = useState<HealthStats[]>([]);
    const [latest, setLatest] = useState<HealthStats | null>(null);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleStats = (stats: HealthStats) => {
            setLatest(stats);
            setHistory(prev => {
                const newHistory = [...prev, stats].slice(-30); // Keep last 30 data points (~1 minute)
                return newHistory;
            });
        };

        socket.on('production.health.stats', handleStats);

        return () => {
            socket.off('production.health.stats');
        };
    }, [socket, isConnected]);

    const chartData = useMemo(() => {
        return history.map(h => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { second: '2-digit' }),
            cpu: Math.round(h.cpuUsage),
            fps: Math.round(h.fps),
            skipped: h.skippedFrames,
        }));
    }, [history]);

    const hasIssues = latest && (latest.cpuUsage > 80 || (latest.totalFrames > 0 && latest.skippedFrames / latest.totalFrames > 0.05));

    return (
        <div className="flex flex-col gap-6 p-6 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        hasIssues ? "bg-red-500/10" : "bg-emerald-500/10"
                    )}>
                        <Activity className={cn(
                            "text-sm animate-pulse",
                            hasIssues ? "text-red-400" : "text-emerald-400"
                        )} size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">System Health</h2>
                        <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest">Live Diagnostics</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {latest && (
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase",
                            hasIssues ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        )}>
                            {hasIssues ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                            {hasIssues ? 'Action Required' : 'System Nominal'}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="CPU Load"
                    value={latest ? `${Math.round(latest.cpuUsage)}%` : '---'}
                    icon={Cpu}
                    color="indigo"
                    status={latest && latest.cpuUsage > 80 ? 'error' : 'normal'}
                />
                <MetricCard
                    label="Frame Rate"
                    value={latest ? `${Math.round(latest.fps)} FPS` : '---'}
                    icon={Zap}
                    color="emerald"
                    status={latest && latest.fps < 24 ? 'warning' : 'normal'}
                />
                <MetricCard
                    label="Drops"
                    value={latest ? latest.skippedFrames.toString() : '---'}
                    icon={BarChart3}
                    color="amber"
                    status={latest && latest.skippedFrames > 10 ? 'warning' : 'normal'}
                />
                <MetricCard
                    label="Memory"
                    value={latest?.memoryUsage ? `${Math.round(latest.memoryUsage / 1024 / 1024)}MB` : '---'}
                    icon={Info}
                    color="stone"
                />
            </div>

            {/* Chart Section */}
            <div className="h-64 w-full bg-stone-950/50 rounded-xl border border-stone-800 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="time"
                            stroke="#57534e"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#57534e"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #44403c', borderRadius: '8px', fontSize: '10px' }}
                            itemStyle={{ color: '#e7e5e4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cpu"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorCpu)"
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="fps"
                            stroke="#10b981"
                            fillOpacity={0}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[10px] font-medium text-stone-500 uppercase tracking-widest bg-stone-950/30 p-3 rounded-lg border border-stone-800/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 bg-indigo-500" /> CPU USAGE</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 bg-emerald-500" /> ACTIVE FPS</div>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-stone-600" />
                    REAL-TIME TELEMETRY ACTIVE
                </div>
            </div>
        </div>
    );
};

interface MetricCardProps {
    label: string;
    value: string;
    icon: React.ElementType;
    color: 'indigo' | 'emerald' | 'amber' | 'stone';
    status?: 'normal' | 'warning' | 'error';
}

const MetricCard = ({ label, value, icon: Icon, color, status = 'normal' }: MetricCardProps) => {
    const colorMap = {
        indigo: "text-indigo-400 bg-indigo-400/10",
        emerald: "text-emerald-400 bg-emerald-400/10",
        amber: "text-amber-400 bg-amber-400/10",
        stone: "text-stone-400 bg-stone-400/10",
    };

    const statusMap = {
        normal: "",
        warning: "border-amber-500/50 bg-amber-500/5",
        error: "border-red-500/50 bg-red-500/5",
    };

    return (
        <div className={cn(
            "p-4 rounded-xl border border-stone-800 bg-stone-950/40 flex flex-col gap-3 transition-all",
            statusMap[status]
        )}>
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{label}</span>
                <div className={cn("p-1.5 rounded-md", colorMap[color])}>
                    <Icon size={12} />
                </div>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">{value}</span>
        </div>
    );
};
