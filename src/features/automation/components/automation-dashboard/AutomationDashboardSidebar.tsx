import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { ExecutionLogs } from '../ExecutionLogs';

interface AutomationDashboardSidebarProps {
    logs: any[];
    isLoading: boolean;
}

export const AutomationDashboardSidebar: React.FC<AutomationDashboardSidebarProps> = ({ logs, isLoading }) => {
    return (
        <div className="bg-card-bg/80 backdrop-blur-2xl border border-card-border rounded-[2.5rem] p-8  relative overflow-hidden flex flex-col h-[800px]">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <History size={150} />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="space-y-1">
                    <h2 className="text-[10px] font-black text-indigo-400 uppercase ">Operational</h2>
                    <p className="text-lg font-black text-foreground uppercase ">System Logs</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse "></div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 relative z-10">
                <ExecutionLogs logs={logs} isLoading={isLoading} />
            </div>

            <div className="pt-6 border-t border-card-border/50 relative z-10">
                <button className="w-full flex items-center justify-center gap-3 p-4 bg-background/50 hover:bg-indigo-600 rounded-2xl text-[10px] font-black text-muted hover:text-white uppercase  transition-all group active:scale-95 ">
                    Master Activity Grid <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};
