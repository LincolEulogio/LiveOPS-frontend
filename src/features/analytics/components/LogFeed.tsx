'use client';

import { ProductionLog } from '../types/analytics.types';
import { cn } from '@/shared/utils/cn';
import { Terminal, Search, Filter, History } from 'lucide-react';
import { useState } from 'react';

interface Props {
    logs: ProductionLog[];
    isLoading: boolean;
}

export const LogFeed = ({ logs, isLoading }: Props) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = logs.filter(log =>
        log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-card-bg border border-card-border rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
            {/* Search Header */}
            <div className="p-4 border-b border-card-border bg-card-bg/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Terminal size={18} />
                    </div>
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Event Feed</h2>
                </div>

                <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search logs..."
                            className="w-full bg-background border border-card-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                        />
                    </div>

                    <select
                        className="bg-background border border-card-border rounded-xl px-3 py-2 text-[10px] font-bold text-muted uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'system') {
                                setSearchTerm('production.user|device');
                            } else {
                                setSearchTerm(val === 'all' ? '' : val);
                            }
                        }}
                    >
                        <option value="all">All Events</option>
                        <option value="obs">OBS Only</option>
                        <option value="vmix">vMix Only</option>
                        <option value="timeline">Timeline Only</option>
                        <option value="system">System Only</option>
                    </select>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-card-bg border-b border-card-border z-10">
                        <tr className="text-[10px] font-bold text-muted uppercase tracking-widest">
                            <th className="text-left py-3 px-6">Timestamp</th>
                            <th className="text-left py-3 px-6">Event Type</th>
                            <th className="text-left py-3 px-6">Source Payload</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border/50">
                        {isLoading && logs.length === 0 ? (
                            Array(10).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-4 px-6"><div className="h-3 w-20 bg-card-border rounded"></div></td>
                                    <td className="py-4 px-6"><div className="h-3 w-32 bg-card-border rounded"></div></td>
                                    <td className="py-4 px-6"><div className="h-3 w-64 bg-card-border rounded"></div></td>
                                </tr>
                            ))
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-20 text-center text-muted">
                                    <div className="flex flex-col items-center gap-3">
                                        <History size={48} strokeWidth={1} className="opacity-10" />
                                        <p className="text-[10px] uppercase font-bold tracking-widest">No matching logs found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="hover:bg-indigo-500/5 transition-colors group cursor-default"
                                >
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <span className="text-[10px] font-mono text-muted">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                        <div className="text-[8px] text-muted/80 mt-0.5">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                                            log.eventType.includes('obs') ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                                                log.eventType.includes('vmix') ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                                    log.eventType.includes('production.user') || log.eventType.includes('device') ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                        "bg-background border-card-border text-muted"
                                        )}>
                                            {log.eventType}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="max-w-md">
                                            <pre className="text-[9px] font-mono text-muted bg-background p-2 rounded-lg border border-card-border/50 overflow-hidden text-ellipsis group-hover:border-card-border transition-colors">
                                                {JSON.stringify(log.details, null, 2).slice(0, 100)}
                                                {JSON.stringify(log.details).length > 100 && '...'}
                                            </pre>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-card-border bg-card-bg/50 flex justify-between items-center text-[10px] font-bold text-muted">
                <span className="uppercase tracking-widest pl-3 flex items-center gap-2">
                    <Filter size={12} />
                    Showing {filteredLogs.length} of {logs.length} events
                </span>
                <span className="uppercase tracking-tighter pr-3">
                    Real-time sync enabled
                </span>
            </div>
        </div>
    );
};
