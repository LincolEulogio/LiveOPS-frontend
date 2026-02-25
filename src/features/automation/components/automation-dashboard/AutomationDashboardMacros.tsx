import React from 'react';
import { Zap, Play } from 'lucide-react';
import { Rule } from '@/features/automation/types/automation.types';

interface AutomationDashboardMacrosProps {
    macros: Rule[];
    onTrigger: (rule: Rule) => void;
}

export const AutomationDashboardMacros: React.FC<AutomationDashboardMacrosProps> = ({ macros, onTrigger }) => {
    if (macros.length === 0) return null;

    return (
        <div className="bg-card-bg/40 backdrop-blur-xl border border-card-border rounded-3xl p-3 sm:p-4 flex items-center gap-4 overflow-x-auto no-scrollbar  group">
            <div className="flex items-center gap-3 pr-6 border-r border-card-border shrink-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Zap size={14} fill="currentColor" />
                </div>
                <span className="text-[10px] font-black text-muted uppercase  whitespace-nowrap hidden sm:block">Tactical Macros</span>
            </div>
            <div className="flex items-center gap-3">
                {macros.map(macro => (
                    <button
                        key={macro.id}
                        onClick={() => onTrigger(macro)}
                        className="flex items-center gap-3 bg-background/50 hover:bg-card-bg text-foreground px-5 py-2.5 rounded-xl text-[10px] font-black uppercase  transition-all border border-card-border whitespace-nowrap active:scale-95 group/macro relative overflow-hidden"
                    >
                        <Play size={10} className="text-indigo-400 group-hover/macro:scale-125 transition-transform" fill="currentColor" />
                        {macro.name}
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/macro:opacity-100 transition-opacity" />
                    </button>
                ))}
            </div>
        </div>
    );
};
