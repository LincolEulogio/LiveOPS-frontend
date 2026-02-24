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
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-white/[0.02]">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Historial de Producción (Audit Trail)
                </h3>
                <button
                    onClick={fetchLogs}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                    Actualizar ahora
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 uppercase text-[10px] tracking-wider bg-slate-950/50">
                        <tr>
                            <th className="px-4 py-3 font-medium">Hora</th>
                            <th className="px-4 py-3 font-medium">Categoría</th>
                            <th className="px-4 py-3 font-medium">Acción / Detalles</th>
                            <th className="px-4 py-3 font-medium">Usuario</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                                    No hay registros disponibles para esta producción aún.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 tabular-nums">
                                        {format(new Date(log.createdAt), 'HH:mm:ss', { locale: es })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            {getIcon(log.eventType)}
                                            <span className="text-xs font-semibold truncate max-w-[120px]">
                                                {log.eventType.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-200 font-medium">
                                        {formatDetails(log.details)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-400 italic">
                                            <User className="w-3 h-3" />
                                            {log.user?.name || 'Sistema'}
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
