import React from 'react';
import { Zap } from 'lucide-react';
import { IntercomTemplate } from '@/features/intercom/types/intercom.types';

interface DashboardQuickActionsProps {
    templates: IntercomTemplate[];
    onMassAlert: (message: string) => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ templates, onMassAlert }) => {
    return (
        <div className="bg-card-bg/30 backdrop-blur-xl border border-card-border/40 rounded-[1.2rem] p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar relative group/actions min-w-0">
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-[0.9rem] shrink-0">
                <div className="relative">
                    <Zap size={13} className="text-amber-400 relative z-10" />
                    <div className="absolute inset-0 bg-amber-400/20 blur-sm animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[7px] font-black text-indigo-400 uppercase leading-none mb-0.5 tracking-tighter">Tactical</span>
                    <span className="text-[9px] font-black text-foreground uppercase whitespace-nowrap">Intercepts</span>
                </div>
            </div>

            <div className="h-6 w-[1px] bg-card-border/50 mx-2 shrink-0" />

            <div className="flex items-center gap-2 pr-4">
                {templates.length > 0 ? templates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => onMassAlert(t.name)}
                        className="shrink-0 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-indigo-500/30 rounded-[0.9rem] text-[9px] font-black text-muted hover:text-foreground uppercase transition-all whitespace-nowrap active:scale-95 group/btn relative overflow-hidden"
                    >
                        <div className="flex items-center gap-2 relative z-10">
                            <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: t.color || '#6366f1' }}
                            />
                            {t.name}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-indigo-500 opacity-0 group-hover/btn:opacity-50 transition-opacity" />
                    </button>
                )) : (
                    <div className="flex items-center gap-3 px-6 h-10 border border-dashed border-card-border/40 rounded-xl opacity-30">
                        <span className="text-[8px] font-black text-muted uppercase tracking-widest italic">Standby Mode: No Protocols Loaded</span>
                    </div>
                )}
            </div>
        </div>
    );
};
