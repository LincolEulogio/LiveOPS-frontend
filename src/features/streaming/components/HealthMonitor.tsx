'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient as api } from '@/shared/api/api.client';
import { useSocket } from '@/shared/socket/socket.provider';
import {
    Activity, Zap, Cpu, BarChart3, Info, AlertTriangle,
    CheckCircle2, Link2, Link2Off, Loader2
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    YAxis,
    XAxis,
    Tooltip as RechartsTooltip
} from 'recharts';
import { cn } from '@/shared/utils/cn';

interface HealthStats {
    productionId: string;
    engineType: string;
    cpuUsage?: number;
    fps?: number;
    bitrate?: number;
    skippedFrames: number;
    totalFrames: number;
    memoryUsage?: number;
    availableDiskSpace?: number;
    isStreaming?: boolean;
    isRecording?: boolean;
    timestamp: string;
    renderTime?: number;
    gpuUsage?: number;
    totalCpuUsage?: number;
    version?: string;
    edition?: string;
}

interface HistoricalTelemetry {
    cpuUsage: number;
    fps: number;
    bitrate: number;
    droppedFrames?: number;
    timestamp: string;
}

interface HealthMonitorProps {
    productionId: string;
}

export const HealthMonitor = ({ productionId }: HealthMonitorProps) => {
    const { socket, isConnected } = useSocket();
    const [history, setHistory] = useState<HealthStats[]>([]);
    const [latest, setLatest] = useState<HealthStats | null>(null);

    const { data: historicalData } = useQuery<HistoricalTelemetry[]>({
        queryKey: ['analytics', productionId, 'telemetry', 'short'],
        queryFn: async () => {
            return api.get<HistoricalTelemetry[]>(`/productions/${productionId}/analytics/telemetry?minutes=10`);
        },
        enabled: !!productionId,
    });

    useEffect(() => {
        if (historicalData && history.length === 0) {
            setHistory(historicalData.map(d => ({
                productionId,
                engineType: 'History',
                cpuUsage: d.cpuUsage,
                fps: d.fps,
                bitrate: d.bitrate,
                skippedFrames: d.droppedFrames || 0,
                totalFrames: 1,
                timestamp: d.timestamp
            })));
        }
    }, [historicalData]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleStats = (stats: HealthStats) => {
            setLatest(stats);
            setHistory(prev => {
                const newHistory = [...prev, stats].slice(-30);
                return newHistory;
            });
        };

        socket.on('production.health.stats', handleStats);
        return () => {
            socket.off('production.health.stats', handleStats);
        };
    }, [socket, isConnected]);

    const chartData = useMemo(() => {
        if (history.length === 0) return [];
        return history.map((h, idx) => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            displayTime: idx % 10 === 0 ? new Date(h.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }) : '',
            cpu: h.cpuUsage !== undefined ? Math.round(h.cpuUsage) : 0,
            fps: h.fps !== undefined ? Math.round(h.fps) : 0,
            bitrate: h.bitrate !== undefined ? (h.bitrate / 100) : 0,
        }));
    }, [history]);

    const hasIssues = latest && (
        (latest.cpuUsage !== undefined && latest.cpuUsage > 80) ||
        (latest.totalFrames !== undefined && latest.totalFrames > 0 && latest.skippedFrames !== undefined && latest.skippedFrames / latest.totalFrames > 0.05)
    );

    const isEngineConnected = latest && (new Date().getTime() - new Date(latest.timestamp).getTime() < 5000);

    return (
        <div className="flex flex-col gap-6 p-6 bg-card-bg border border-card-border rounded-2xl  overflow-hidden relative">
            {/* Background Accent */}
            <div className={cn(
                "absolute top-0 right-0 w-64 h-64 blur-[100px] -mr-32 -mt-32 opacity-10 transition-colors duration-1000",
                isEngineConnected ? (hasIssues ? "bg-red-500" : "bg-emerald-500") : "bg-muted"
            )} />

            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg transition-all duration-500",
                        isEngineConnected
                            ? (hasIssues ? "bg-red-500/20 text-red-400 " : "bg-emerald-500/20 text-emerald-400")
                            : "bg-muted/10 text-muted"
                    )}>
                        <Activity className={cn(
                            "text-sm",
                            isEngineConnected && "animate-pulse"
                        )} size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground  leading-none mb-1">Salud del Sistema</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] text-muted uppercase font-black ">Telemetría en Vivo</p>
                            <div className="w-1 h-1 rounded-full bg-card-border" />
                            <span className="text-[9px] font-bold text-indigo-400/80 uppercase">
                                {latest?.engineType || '---'}
                                {latest?.version && ` v${latest.version}`}
                                {latest?.edition && ` (${latest.edition})`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase  transition-all duration-500",
                        !isConnected
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : !isEngineConnected
                                ? "bg-muted/10 border-card-border text-muted"
                                : hasIssues
                                    ? "bg-red-500/10 border-red-500/20 text-red-400 "
                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                        {!isConnected ? <><Link2Off size={12} className="animate-pulse" /> Sin Conexión</>
                            : !isEngineConnected ? <><Info size={12} /> Motor Offline</>
                                : <>{hasIssues ? <AlertTriangle size={12} className="animate-bounce" /> : <CheckCircle2 size={12} />} {hasIssues ? 'Atención Requerida' : 'Sistema Nominal'}</>}
                    </div>
                </div>
            </div>

            {/* Main Metrics Grid - Responsive Auto-Fill */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 relative z-10 w-full">
                <MetricCard
                    label="Salida Bitrate"
                    value={isEngineConnected && latest?.bitrate !== undefined ? `${(latest.bitrate / 1000).toFixed(1)} Mbps` : '0.0 Mbps'}
                    icon={Zap}
                    color="emerald"
                    status={isEngineConnected && latest?.bitrate !== undefined && latest.bitrate < 3000 && latest.isStreaming ? 'warning' : 'normal'}
                    tooltip="Velocidad de subida actual hacia los servidores de streaming."
                />
                <MetricCard
                    label={latest?.engineType === 'VMIX' ? "CPU vMix" : "Carga CPU"}
                    value={isEngineConnected && latest?.cpuUsage !== undefined && latest.cpuUsage > 0 ? `${Math.round(latest.cpuUsage)}%` : (latest?.engineType === 'VMIX' ? '0%' : 'N/A')}
                    icon={Cpu}
                    color="indigo"
                    status={isEngineConnected && latest?.cpuUsage !== undefined && latest.cpuUsage > 80 ? 'error' : 'normal'}
                    tooltip={latest?.engineType === 'VMIX' ? "Carga específica del proceso vMix." : "Carga acumulada del procesador para procesos de video."}
                />
                <MetricCard
                    label="Frame Rate"
                    value={isEngineConnected && latest?.fps !== undefined && latest.fps > 0 ? `${Math.round(latest.fps)} FPS` : (latest?.engineType === 'VMIX' ? '60 FPS' : 'N/A')}
                    icon={Activity}
                    color="indigo"
                    status={isEngineConnected && latest?.fps !== undefined && latest.fps > 0 && latest.fps < 24 ? 'warning' : 'normal'}
                    tooltip="Frames por segundo efectivos en la salida del motor."
                />

                {latest?.engineType === 'VMIX' && (
                    <MetricCard
                        label="Render Time"
                        value={isEngineConnected && latest?.renderTime !== undefined ? `${latest.renderTime} ms` : '0 ms'}
                        icon={Activity}
                        color="amber"
                        status={latest.renderTime && latest.renderTime > 20 ? 'warning' : 'normal'}
                        tooltip="Latencia de renderizado interno de vMix."
                    />
                )}

                <MetricCard
                    label="Dropped Frames"
                    value={isEngineConnected && latest?.skippedFrames !== undefined ? latest.skippedFrames.toString() : '0'}
                    icon={BarChart3}
                    color="amber"
                    status={isEngineConnected && latest?.skippedFrames !== undefined && latest.skippedFrames > 10 ? 'warning' : 'normal'}
                    tooltip="Pérdida de cuadros detectada por congestión o hardware."
                />
                <MetricCard
                    label="Espacio Disco"
                    value={isEngineConnected && latest?.availableDiskSpace !== undefined ? `${(latest.availableDiskSpace / 1024).toFixed(1)} GB` : '---'}
                    icon={Info}
                    color="stone"
                    status={isEngineConnected && latest?.availableDiskSpace !== undefined && latest.availableDiskSpace < 10000 ? 'warning' : 'normal'}
                    tooltip="Espacio disponible para grabaciones locales en el motor."
                />
            </div>

            {/* Chart Section */}
            <div className="relative h-48 w-full bg-background/50 rounded-xl border border-card-border/80 p-2 group">
                {!isEngineConnected && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px]">
                        <Activity className="text-muted/50 mb-1 animate-pulse" size={24} />
                        <p className="text-[9px] font-black text-muted uppercase ">Esperando Señal</p>
                    </div>
                )}
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBitrate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="displayTime"
                                stroke="#78716c"
                                fontSize={7}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="#78716c"
                                fontSize={7}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                                tickCount={5}
                            />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #444', borderRadius: '8px', fontSize: '9px' }}
                                itemStyle={{ padding: '0px' }}
                            />
                            <Area type="monotone" dataKey="cpu" stroke="#6366f1" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={1.5} isAnimationActive={false} name="CPU %" />
                            <Area type="monotone" dataKey="bitrate" stroke="#10b981" fillOpacity={1} fill="url(#colorBitrate)" strokeWidth={1.5} isAnimationActive={false} name="Bitrate" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-muted font-black uppercase">Sin Datos Históricos</div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-[10px] font-black text-muted uppercase  bg-background/40 px-4 py-3 rounded-xl border border-card-border/50 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-0.5 bg-indigo-500 rounded-full" /> USO DE CPU
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-0.5 bg-emerald-500 rounded-full" /> FPS ACTIVOS
                    </div>
                </div>
                <div className="flex items-center gap-2 text-muted">
                    <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-500", isEngineConnected ? "bg-emerald-500 animate-pulse " : "bg-muted")} />
                    TELEMETRÍA ACTIVA
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
    tooltip?: string;
}

const MetricCard = ({ label, value, icon: Icon, color, status = 'normal', tooltip }: MetricCardProps) => {
    const colorMap = {
        indigo: "text-indigo-400 bg-indigo-400/10",
        emerald: "text-emerald-400 bg-emerald-400/10",
        amber: "text-amber-400 bg-amber-400/10",
        stone: "text-muted bg-muted/10",
    };

    const statusMap = {
        normal: "border-card-border",
        warning: "border-amber-500/30 bg-amber-500/5",
        error: "border-red-500/30 bg-red-500/5",
    };

    return (
        <div className={cn("p-4 rounded-xl border bg-background/40 flex flex-col gap-3 transition-all hover:border-indigo-500/50 group ", statusMap[status])} title={tooltip}>
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-muted uppercase opacity-60 truncate mr-2">{label}</span>
                <div className={cn("p-1.5 rounded-lg shrink-0", colorMap[color])}><Icon size={12} /></div>
            </div>
            <span className={cn("text-xl 2xl:text-2xl font-black ", value === 'N/A' || value === '---' ? "text-muted/50" : "text-foreground")}>{value}</span>
        </div>
    );
};
