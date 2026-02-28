'use client';

import { RuleExecutionLog } from '@/features/automation/types/automation.types';
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
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 bg-card-bg/20 border border-card-border/30 rounded-3xl w-full animate-pulse relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/2 to-transparent animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center relative overflow-hidden group/empty">
        <div className="absolute inset-0 bg-indigo-500/1 pointer-events-none" />
        <div className="relative mb-8 group-hover/empty:scale-110 transition-transform duration-700">
          <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-20 h-20 bg-card-bg/40 backdrop-blur-xl border border-card-border rounded-4xl flex items-center justify-center shadow-2xl">
            <Clock size={32} strokeWidth={1} className="text-muted-foreground/30" />
          </div>
        </div>
        <div className="relative z-10 max-w-xs px-6">
          <h3 className="text-sm font-black uppercase text-foreground/40 tracking-[.25em] mb-2 leading-tight">
            Quiet Operational Surface
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/30 leading-relaxed">
            No execution cycles detected in this session. Monitoring logic engine core...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false} mode="popLayout">
        {logs.map((log) => (
          <motion.div
            layout
            key={log.id}
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className={cn(
              'group flex items-start gap-5 p-5 bg-card-bg/40 backdrop-blur-3xl border border-card-border/50 rounded-3xl transition-all duration-500 relative overflow-hidden active:scale-[0.99] hover:bg-card-bg/60 shadow-sm'
            )}
          >
            {/* Status Vertical Trace */}
            <div
              className={cn(
                'absolute left-0 top-0 bottom-0 w-1 shadowed-indicator transition-colors duration-500',
                log.status === 'SUCCESS'
                  ? 'bg-emerald-500 shadow-[2px_0_10px_rgba(16,185,129,0.5)]'
                  : 'bg-red-500 shadow-[2px_0_10px_rgba(239,68,68,0.5)]'
              )}
            />

            <div
              className={cn(
                'mt-0.5 w-12 h-12 rounded-2xl border shrink-0 flex items-center justify-center transition-all shadow-inner',
                log.status === 'SUCCESS'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 animate-pulse'
              )}
            >
              {log.status === 'SUCCESS' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>

            <div className="flex-1 min-w-0 py-0.5">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h4 className="text-[11px] font-black text-foreground uppercase tracking-wider truncate flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shadow-[0_0_8px]',
                      log.status === 'SUCCESS'
                        ? 'bg-indigo-500 shadow-indigo-500/50'
                        : 'bg-red-500 animate-pulse shadow-red-500/50'
                    )}
                  />
                  {log.rule?.name || 'Automated Protocol'}
                </h4>
                <div className="flex items-center gap-2.5 bg-black/10 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                  <Clock size={11} className="text-muted-foreground/60" />
                  <span className="text-[10px] font-black font-mono text-muted-foreground/80 tracking-tighter">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity
                  size={12}
                  className={cn(
                    'mt-1 shrink-0 opacity-40',
                    log.status === 'SUCCESS'
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                />
                <p
                  className={cn(
                    'text-[11px] sm:text-[12px] leading-relaxed font-bold tracking-tight',
                    log.status === 'SUCCESS'
                      ? 'text-muted-foreground group-hover:text-foreground transition-colors'
                      : 'text-red-600 dark:text-red-400/90'
                  )}
                >
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
