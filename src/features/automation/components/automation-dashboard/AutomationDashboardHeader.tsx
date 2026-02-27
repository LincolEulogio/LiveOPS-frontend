import React from 'react';
import { Zap, Plus, Sparkles } from 'lucide-react';

interface AutomationDashboardHeaderProps {
    onCreateRule: () => void;
    onAiBuild?: () => void;
}

export const AutomationDashboardHeader: React.FC<AutomationDashboardHeaderProps> = ({ onCreateRule, onAiBuild }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card-bg/60 backdrop-blur-2xl border border-card-border p-6 sm:p-10 rounded-[2.5rem]  overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-700">
                <Zap size={180} />
            </div>

            <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600/10 rounded-4xl flex items-center justify-center border border-indigo-500/20 ">
                    <Zap className="text-indigo-400" size={32} />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-foreground uppercase er leading-none mb-3">
                        Automation Engine
                    </h1>
                    <p className="text-muted text-[10px] sm:text-xs font-bold uppercase  max-w-md leading-loose">
                        Orchestrate complex sequences. Event-driven logic for high-performance production workflows.
                    </p>
                </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3">
                {onAiBuild && (
                    <button
                        onClick={onAiBuild}
                        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-400 px-8 py-4 rounded-2xl font-black uppercase text-xs transition-all group active:scale-95"
                    >
                        <Sparkles size={18} className="text-indigo-400 group-hover:animate-pulse" />
                        AI Build
                    </button>
                )}
                
                <button
                    onClick={onCreateRule}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs transition-all group active:scale-95"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                    Initialize New Rule
                </button>
            </div>
        </div>
    );
};
