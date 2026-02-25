"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/api.client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollText, Clock, User, Info, Activity, AlertTriangle, Radio, Film } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface AuditLog {
    id: string;
    createdAt: string;
    eventType: string;
    details: any;
    user?: { name: string };
}

interface Props {
    productionId: string;
}

export const AuditLogView = ({ productionId }: Props) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const data = await apiClient.get<AuditLog[]>(`/audit/production/${productionId}`);
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, [productionId]);

    const getIcon = (type: string) => {
        if (type.includes('STREAM')) return <Radio className="w-4 h-4 text-blue-400" />;
        if (type.includes('RECORD')) return <Film className="w-4 h-4 text-red-500" />;
        if (type.includes('SCENE')) return <Activity className="w-4 h-4 text-purple-400" />;
        if (type.includes('INTERCOM')) return <ScrollText className="w-4 h-4 text-yellow-500" />;
        if (type.includes('AUTOMATION')) return <Info className="w-4 h-4 text-green-400" />;
        return <Clock className="w-4 h-4 text-slate-400" />;
    };

    const formatDetails = (details: any) => {
        if (!details) return '-';
        if (typeof details === 'string') return details;
        if (details.message) return details.message;
        if (details.sceneName) return `Escena: ${details.sceneName}`;
        if (details.ruleName) return `Regla: ${details.ruleName}`;
        return JSON.stringify(details);
    };

    if (loading && logs.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2rem] overflow-hidden  relative">
            {/* Visual Scanline Header Decoration */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

            <div className="p-6 border-b border-card-border flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-xs font-black text-foreground uppercase  flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Activity size={16} />
                    </div>
                    <span>Historial de Producción <span className="text-muted ml-1 opacity-50">(Audit Trail)</span></span>
                </h3>
                <button
                    onClick={fetchLogs}
                    className="px-4 py-1.5 bg-background/50 hover:bg-card-border border border-card-border rounded-xl text-[10px] font-black text-muted hover:text-foreground uppercase  transition-all active:scale-95"
                >
                    Refrescar Telemetría
                </button>
            </div>

            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                    <thead className="bg-background/40 border-b border-card-border">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-muted uppercase ">Temporal</th>
                            <th className="px-6 py-4 text-[10px] font-black text-muted uppercase ">Criterio</th>
                            <th className="px-6 py-4 text-[10px] font-black text-muted uppercase ">Vector de Datos / Registro</th>
                            <th className="px-6 py-4 text-[10px] font-black text-muted uppercase ">Identidad</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border/30">
                        {loading && logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                        <span className="text-[10px] font-black text-muted uppercase  animate-pulse">Sincronizando Archivos...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center">
                                    <p className="text-[10px] font-black text-muted uppercase  italic">No se han detectado fluctuaciones en el sistema aún.</p>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.03] transition-colors group relative">
                                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-indigo-400/80 tabular-nums  uppercase">
                                        {format(new Date(log.createdAt), 'HH:mm:ss', { locale: es })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-background/50 flex items-center justify-center border border-card-border group-hover:bg-white/5 transition-colors">
                                                {getIcon(log.eventType)}
                                            </div>
                                            <span className="text-[10px] font-extrabold text-foreground/70 uppercase  truncate max-w-[140px]">
                                                {log.eventType.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[11px] font-black text-foreground uppercase  leading-relaxed max-w-xl group-hover:text-indigo-400 transition-colors">
                                            {formatDetails(log.details)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-background/30 rounded-lg border border-transparent group-hover:border-card-border transition-all">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                                            <span className="text-[10px] font-black text-muted uppercase  italic group-hover:text-foreground">
                                                {log.user?.name || 'Sistema Core'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
