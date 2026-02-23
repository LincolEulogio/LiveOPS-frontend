'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Activity,
    Cpu,
    Zap,
    BarChart3,
    CheckCircle2,
    AlertTriangle,
    Layout,
    Clock,
    ExternalLink
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PublicStatusPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: status, isLoading, error } = useQuery({
        queryKey: ['public-status', id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE_URL}/public/productions/${id}/status`);
            return response.data;
        },
        refetchInterval: 5000, // Poll every 5 seconds for the public page
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-8">
                <Activity className="text-indigo-500 w-12 h-12 animate-pulse mb-4" />
                <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Conectando con LiveOPS...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-8 text-center">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                    <AlertTriangle className="text-red-500 w-12 h-12" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Página no Disponible</h1>
                <p className="text-stone-500 max-w-md">
                    Esta producción no existe o el acceso público ha sido deshabilitado por el operador.
                </p>
            </div>
        );
    }

    const chartData = status.telemetry.map((h: any) => ({
        time: new Date(h.timestamp).toLocaleTimeString([], { second: '2-digit' }),
        cpu: Math.round(h.cpuUsage) || 0,
        fps: Math.round(h.fps) || 0,
    }));

    const latestStats = status.telemetry[status.telemetry.length - 1] || {};
    const isHealthy = (latestStats.cpuUsage || 0) < 85;

    return (
        <div className="min-h-screen bg-stone-950 text-stone-300 font-sans selection:bg-indigo-500/30">
            {/* Premium Header */}
            <nav className="border-b border-stone-900 bg-stone-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Zap className="text-white fill-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-white font-black text-lg tracking-tight leading-none mb-1">{status.productionName}</h1>
                            <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", isHealthy ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Estado en Vivo</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Motor de Video</span>
                            <span className="text-sm font-bold text-white uppercase">{status.engineType}</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-stone-900 border border-stone-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                            {/* Background Glow */}
                            <div className={cn(
                                "absolute top-0 right-0 w-96 h-96 blur-[120px] -mr-48 -mt-48 transition-colors duration-1000",
                                isHealthy ? "bg-emerald-500/10" : "bg-red-500/10"
                            )} />

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
                                            <Layout className="text-indigo-400" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-1">Segmento Actual</p>
                                            <h2 className="text-2xl font-black text-white tracking-tight">{status.activeSegment}</h2>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Emitiendo</span>
                                    </div>
                                </div>

                                {/* Telemetry Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                            <Cpu size={12} className="text-indigo-400" /> Carga CPU
                                        </p>
                                        <p className="text-3xl font-black text-white tracking-tighter">
                                            {Math.round(latestStats.cpuUsage || 0)}%
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                            <Zap size={12} className="text-emerald-400" /> Rendimiento
                                        </p>
                                        <p className="text-3xl font-black text-white tracking-tighter">
                                            {Math.round(latestStats.fps || 0)} FPS
                                        </p>
                                    </div>
                                    <div className="hidden md:block space-y-1">
                                        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                            <BarChart3 size={12} className="text-amber-400" /> Drops
                                        </p>
                                        <p className="text-3xl font-black text-white tracking-tighter">
                                            {latestStats.droppedFrames || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Chart */}
                        <div className="bg-stone-900 border border-stone-800 p-8 rounded-[2rem] shadow-2xl space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity className="text-indigo-400" size={20} />
                                    Estabilidad de Señal
                                </h3>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="time" stroke="#44403c" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#44403c" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#0c0a09', border: '1px solid #292524', borderRadius: '16px', fontSize: '10px' }}
                                        />
                                        <Area type="monotone" dataKey="cpu" stroke="#6366f1" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={3} isAnimationActive={true} name="CPU %" />
                                        <Area type="monotone" dataKey="fps" stroke="#10b981" fillOpacity={0} strokeWidth={3} isAnimationActive={true} name="FPS" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Side Info */}
                    <div className="space-y-6">
                        <div className="bg-stone-900 border border-stone-800 p-8 rounded-[2rem] shadow-2xl">
                            <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                                <Clock className="text-indigo-400" size={16} /> Último Reporte
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-stone-800">
                                    <span className="text-stone-500 text-sm">Hora Local</span>
                                    <span className="text-white font-bold">{new Date().toLocaleTimeString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-stone-800">
                                    <span className="text-stone-500 text-sm">Estado Global</span>
                                    <span className="text-emerald-400 font-bold uppercase text-xs">Operativo</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-stone-500 text-sm">Uptime Relay</span>
                                    <span className="text-white font-bold">99.9%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/10 text-white space-y-4">
                            <h3 className="font-black text-xl tracking-tight italic">LiveOPS Professional</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed">
                                Esta es una página de estado segura y de solo lectura generada por LiveOPS para transparencia con el cliente.
                            </p>
                            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                                Ver Plataforma <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto p-12 text-center">
                <p className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.3em]">
                    Powered by LiveOPS Enterprise — &copy; {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}
