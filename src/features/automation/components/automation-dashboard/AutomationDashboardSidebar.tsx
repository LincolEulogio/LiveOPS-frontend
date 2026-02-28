import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { ExecutionLogs } from '@/features/automation/components/ExecutionLogs';

interface AutomationDashboardSidebarProps {
  logs: any[];
  isLoading: boolean;
}

export const AutomationDashboardSidebar: React.FC<AutomationDashboardSidebarProps> = ({
  logs,
  isLoading,
}) => {
  return (
    <div className="bg-card-bg/60 backdrop-blur-3xl border border-card-border rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden flex flex-col h-[850px] shadow-2xl group/sidebar">
      <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none group-hover/sidebar:scale-110 group-hover/sidebar:opacity-10 transition-all duration-1000">
        <History size={180} strokeWidth={1} />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] leading-none">
              Operational status
            </h2>
          </div>
          <h1 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">
            Logic <span className="text-indigo-600">Logs</span>
          </h1>
        </div>
        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse border-2 border-white/20" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8 relative z-10">
        <ExecutionLogs logs={logs} isLoading={isLoading} />
      </div>

      <div className="pt-8 border-t border-card-border/50 relative z-10">
        <button className="w-full flex items-center justify-center gap-4 p-5 bg-background/50 hover:bg-indigo-600 border border-card-border/50 rounded-2xl text-[11px] font-black text-muted-foreground hover:text-white uppercase tracking-widest transition-all group/btn active:scale-95 shadow-sm">
          View Master Chronology{' '}
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
