'use client';

import { RuleExecutionLog } from '../types/automation.types';
import { cn } from '@/shared/utils/cn';
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

interface Props {
    logs: RuleExecutionLog[];
    isLoading: boolean;
}

export const ExecutionLogs = ({ logs, isLoading }: Props) => {
    if (isLoading && logs.length === 0) {
        return (
            <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-stone-900 border border-stone-800 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-stone-600">
                <Clock size={32} strokeWidth={1} className="mb-2 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest font-bold">No execution history</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {logs.map((log) => (
                <div
                    key={log.id}
                    className="group flex items-start gap-4 p-4 bg-stone-900/50 border border-stone-800 rounded-xl hover:bg-stone-900 transition-all animate-in fade-in slide-in-from-right-2 duration-300"
                >
                    <div className={cn(
                        "mt-1 p-1.5 rounded-lg border",
                        log.status === 'SUCCESS'
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                        {log.status === 'SUCCESS' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                            <h4 className="text-xs font-bold text-white truncate flex items-center gap-2">
                                <Zap size={12} className="text-yellow-500" />
                                {log.rule?.name || 'Unknown Rule'}
                            </h4>
                            <span className="text-[10px] font-mono text-stone-500 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleTimeString([], { hour12: false })}
                            </span>
                        </div>
                        <p className={cn(
                            "text-[10px] leading-relaxed line-clamp-2",
                            log.status === 'SUCCESS' ? "text-stone-400" : "text-red-400/80 font-medium"
                        )}>
                            {log.details}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
