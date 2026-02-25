import React from 'react';
import { Zap } from 'lucide-react';
import { IntercomTemplate } from '../../types/intercom.types';

interface DashboardQuickActionsProps {
    templates: IntercomTemplate[];
    onMassAlert: (message: string) => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ templates, onMassAlert }) => {
    return (
        <div className="bg-card-bg/40 backdrop-blur-xl border border-card-border/60 rounded-[1.5rem] p-3 flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar  relative group/actions min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 border-r border-card-border shrink-0">
                <Zap size={14} className="text-amber-400 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] font-black text-muted uppercase  sm: whitespace-nowrap">Rapid Response Intercepts</span>
            </div>
            <div className="flex items-center gap-3">
                {templates.length > 0 ? templates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => onMassAlert(t.name)}
                        className="shrink-0 px-5 py-2.5 bg-background/50 hover:bg-card-bg border border-card-border hover:border-indigo-500/40 rounded-xl text-[9px] font-black text-foreground/60 hover:text-foreground uppercase  transition-all whitespace-nowrap active:scale-95  group/btn relative overflow-hidden"
                    >
                        {t.name}
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                )) : (
                    <span className="shrink-0 text-[9px] font-black text-muted/30 uppercase  px-4 italic">No protocols defined</span>
                )}
            </div>
        </div>
    );
};
