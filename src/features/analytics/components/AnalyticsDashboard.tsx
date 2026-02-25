'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient as api } from '@/shared/api/api.client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, HardDrive, WifiHigh, CheckCircle, AlertTriangle, FileText, Download, ArrowLeft, Bot, Sparkles } from 'lucide-react';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { useProduction } from '@/features/productions/hooks/useProductions';
import Link from 'next/link';

interface TelemetryLog {
    timestamp: string;
    cpuUsage: number | null;
    memoryUsage: number | null;
    fps: number | null;
    bitrate: number | null;
    droppedFrames: number | null;
    isStreaming: boolean;
}

interface ShowReport {
    durationMs: number;
    metrics: {
        totalDroppedFrames: number;
        maxCpu: number;
        avgFps: number;
    };
    generatedAt: string;
    aiAnalysis?: string;
}

export const AnalyticsDashboard = ({ productionId }: { productionId: string }) => {
    useProductionContextInitializer(productionId);
    const { data: production } = useProduction(productionId);
    const isLive = production?.status === 'ACTIVE';
    const isArchived = production?.status === 'ARCHIVED';

    const { data: telemetry, isLoading: telLoading } = useQuery({
        queryKey: ['analytics', productionId, 'telemetry'],
        queryFn: (): Promise<TelemetryLog[]> => {
            return api.get<TelemetryLog[]>(`/productions/${productionId}/analytics/telemetry?minutes=60`).catch(() => []);
        },
        enabled: !!productionId,
        refetchInterval: isLive ? 10000 : false, // Poll if live
    });

    const { data: report, refetch: refetchReport } = useQuery({
        queryKey: ['analytics', productionId, 'report'],
        queryFn: (): Promise<ShowReport> => {
            return api.get<ShowReport>(`/productions/${productionId}/analytics/report`);
        },
        enabled: !!productionId,
    });

    const generateReportMutation = useMutation({
        mutationFn: async () => {
            return api.post<ShowReport>(`/productions/${productionId}/analytics/report/generate`);
        },
        onSuccess: () => refetchReport(),
    });

    if (!production) return null;

    const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const chartData = telemetry?.map(t => ({
        time: formatTime(t.timestamp),
        bitrate: t.bitrate || 0,
        cpu: t.cpuUsage || 0,
        fps: t.fps || 0,
        dropped: t.droppedFrames || 0,
    })) || [];

    return (
        <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/productions/${productionId}`}
                        className="p-2 bg-card-bg border border-card-border rounded-xl text-muted hover:text-foreground hover:border-indigo-500/50 transition-all "
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Activity className="text-indigo-500" />
                            Health & Analytics
                        </h2>
                        <p className="text-sm text-muted">System telemetry and post-show metrics</p>
                    </div>
                </div>
                {isArchived && !report && (
                    <button
                        onClick={() => generateReportMutation.mutate()}
                        disabled={generateReportMutation.isPending}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-bold"
                    >
                        <FileText size={18} />
                        {generateReportMutation.isPending ? 'Generating...' : 'Generate Show Report'}
                    </button>
                )}
            </div>

            {/* Post-Show Report Highlight */}
            {report && (
                <div className="bg-gradient-to-br from-indigo-900/40 to-stone-900 border border-indigo-500/30 rounded-2xl p-6 ">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold  text-indigo-400 uppercase flex items-center gap-2">
                            <CheckCircle size={20} />
                            Post-Show Report
                        </h3>
                        <span className="text-xs font-mono text-muted bg-background px-2 py-1 rounded">
                            {new Date(report.generatedAt).toLocaleString()}
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        <div className="bg-background p-4 rounded-xl border border-card-border">
                            <span className="block text-muted text-xs font-bold uppercase mb-1">Total Duration</span>
                            <span className="text-2xl font-bold text-foreground">
                                {Math.floor(report.durationMs / 60000)}m {(Math.floor(report.durationMs / 1000) % 60)}s
                            </span>
                        </div>
                        <div className="bg-background p-4 rounded-xl border border-card-border">
                            <span className="block text-muted text-xs font-bold uppercase mb-1">Avg FPS</span>
                            <span className="text-2xl font-bold text-emerald-400">{report.metrics?.avgFps?.toFixed(1) || 0}</span>
                        </div>
                        <div className="bg-background p-4 rounded-xl border border-card-border">
                            <span className="block text-muted text-xs font-bold uppercase mb-1">Max CPU</span>
                            <span className="text-2xl font-bold text-amber-400">{report.metrics?.maxCpu?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="bg-background p-4 rounded-xl border border-card-border">
                            <span className="block text-muted text-xs font-bold uppercase mb-1">Dropped Frames</span>
                            <span className="text-2xl font-bold text-red-400">{report.metrics?.totalDroppedFrames || 0}</span>
                        </div>
                    </div>

                    {report.aiAnalysis && (
                        <div className="mt-8 pt-8 border-t border-indigo-500/20">
                            <div className="flex items-center gap-2 mb-4 text-indigo-400">
                                <Bot size={20} />
                                <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                    AI Performance Insights
                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Sparkles size={10} />
                                        POWERED BY GEMINI
                                    </span>
                                </h4>
                            </div>
                            <div className="bg-background/40 p-5 rounded-xl border border-indigo-500/10 text-sm leading-relaxed text-stone-200 whitespace-pre-wrap font-medium">
                                {report.aiAnalysis}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Telemetry Charts */}
            <div className="grid grid-cols-2 gap-6">

                {/* Bitrate Chart */}
                <div className="col-span-2 bg-card-bg border border-card-border rounded-2xl p-6 ">
                    <h3 className="text-sm font-bold text-muted uppercase  flex items-center gap-2 mb-6">
                        <WifiHigh size={16} className="text-emerald-500" />
                        Network Bitrate (kbps)
                    </h3>
                    {telLoading ? <div className="h-64 animate-pulse bg-card-border/50 rounded-xl" /> : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                                    <XAxis dataKey="time" stroke="#57534e" fontSize={10} tickMargin={10} />
                                    <YAxis stroke="#57534e" fontSize={10} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#fff' }}
                                        itemStyle={{ color: '#10b981' }}
                                    />
                                    <Line type="monotone" dataKey="bitrate" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* CPU Chart */}
                <div className="bg-card-bg border border-card-border rounded-2xl p-6 ">
                    <h3 className="text-sm font-bold text-muted uppercase  flex items-center gap-2 mb-6">
                        <Cpu size={16} className="text-amber-500" />
                        Encoder CPU Usage (%)
                    </h3>
                    {telLoading ? <div className="h-48 animate-pulse bg-card-border/50 rounded-xl" /> : (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                                    <XAxis dataKey="time" stroke="#57534e" fontSize={10} />
                                    <YAxis stroke="#57534e" fontSize={10} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c' }} />
                                    <Line type="monotone" dataKey="cpu" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* FPS & Drops Chart */}
                <div className="bg-card-bg border border-card-border rounded-2xl p-6 ">
                    <h3 className="text-sm font-bold text-muted uppercase  flex items-center gap-2 mb-6">
                        <AlertTriangle size={16} className="text-red-500" />
                        Dropped Frames
                    </h3>
                    {telLoading ? <div className="h-48 animate-pulse bg-card-border/50 rounded-xl" /> : (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                                    <XAxis dataKey="time" stroke="#57534e" fontSize={10} />
                                    <YAxis stroke="#57534e" fontSize={10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c' }} />
                                    <Line type="stepAfter" dataKey="dropped" stroke="#ef4444" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};
