'use client';

import { RuleExecutionLog } from '../types/automation.types';
import { cn } from '@/shared/utils/cn';
import { CheckCircle2, AlertCircle, Clock, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    logs: RuleExecutionLog[];
    isLoading: boolean;
}

export const ExecutionLogs = ({ logs, isLoading }: Props) => {
    if (isLoading && logs.length === 0) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-card-bg/40 border border-card-border/50 rounded-2xl w-full"></div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20 text-muted/40">
                <div className="relative mb-6">
                    <Clock size={40} strokeWidth={1} className="opacity-20" />
                    <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full" />
                </div>
                <div className="text-center">
                    <p className="text-[11px] font-black uppercase  text-foreground/30">Quiet Operational Surface</p>
                    <p className="text-[9px] font-bold uppercase  mt-1">No execution cycles detected in this session</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence initial={false}>
                {logs.map((log) => (
                    <motion.div
                        layout
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={cn(
                            "group flex items-start gap-4 p-4 bg-white/5 backdrop-blur-md border border-card-border/50 rounded-2xl hover:bg-white/[0.08] hover:border-indigo-500/20 transition-all duration-300 relative overflow-hidden"
                        )}
                    >
                        {/* Status Vertical Trace */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1",
                            log.status === 'SUCCESS' ? "bg-emerald-500/50" : "bg-red-500/50"
                        )} />

                        <div className={cn(
                            "mt-0.5 p-2 rounded-xl border shrink-0 flex items-center justify-center shadow-inner",
                            log.status === 'SUCCESS'
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                        )}>
                            {log.status === 'SUCCESS' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4 mb-1.5">
                                <h4 className="text-[11px] font-black text-foreground/90 uppercase  truncate flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                    {log.rule?.name || 'Automated Protocol'}
                                </h4>
                                <div className="flex items-center gap-2 bg-black/20 px-2 py-0.5 rounded-lg border border-white/5">
                                    <Clock size={10} className="text-muted" />
                                    <span className="text-[9px] font-black font-mono text-muted/80 whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleTimeString([], { hour12: false })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Activity size={10} className={cn("mt-1 shrink-0", log.status === 'SUCCESS' ? "text-indigo-400" : "text-red-400")} />
                                <p className={cn(
                                    "text-[10px] sm:text-[11px] leading-relaxed font-medium",
                                    log.status === 'SUCCESS' ? "text-muted-foreground group-hover:text-foreground/80 transition-colors" : "text-red-400/90"
                                )}>
                                    {log.details}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
