import React from 'react';
import { Zap, Plus, Sparkles } from 'lucide-react';

interface AutomationDashboardHeaderProps {
  onCreateRule: () => void;
  onAiBuild?: () => void;
}

export const AutomationDashboardHeader: React.FC<AutomationDashboardHeaderProps> = ({
  onCreateRule,
  onAiBuild,
}) => {
  return (
    <div className="bg-card-bg/60 backdrop-blur-3xl border border-card-border p-8 sm:p-14 rounded-[2.5rem] overflow-hidden relative group/header shadow-2xl">
      {/* Visual Scanline Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover/header:opacity-100 transition-all duration-700 pointer-events-none" />

      <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none group-hover/header:scale-110 group-hover/header:opacity-10 transition-all duration-1000 rotate-12">
        <Zap size={220} strokeWidth={1} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-indigo-600/10 rounded-4xl flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover/header:scale-105 transition-transform duration-500">
            <Zap className="text-indigo-600 dark:text-indigo-400" size={36} />
          </div>
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <Plus size={10} className="text-indigo-500 animate-pulse" />
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[.25em] leading-none">
                Operational Logic Engine
              </h2>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground uppercase italic leading-none tracking-tight mb-4">
              Automation <span className="text-indigo-600">Engine</span>
            </h1>
            <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-relaxed max-w-lg">
              Orchestrate complex sequences. Event-driven logic for high-performance production
              workflows. Manifest efficiency through rule matrices.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {onAiBuild && (
            <button
              onClick={onAiBuild}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 dark:bg-white/3 dark:hover:bg-white/8 border border-card-border text-indigo-600 dark:text-indigo-400 px-8 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all group/btn active:scale-95 shadow-sm"
            >
              <Sparkles size={16} className="group-hover/btn:animate-pulse" />
              AI Build System
            </button>
          )}

          <button
            onClick={onCreateRule}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all group/btn active:scale-95 shadow-xl shadow-indigo-600/20 border border-indigo-400/30"
          >
            <Plus
              size={18}
              className="group-hover/btn:rotate-180 transition-transform duration-700"
            />
            Initialize New Rule
          </button>
        </div>
      </div>
    </div>
  );
};
