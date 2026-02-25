'use client';

import React from 'react';

export const DashboardFooter: React.FC = () => {
    return (
        <footer className="mt-12 border-t border-card-border bg-white/[0.02] backdrop-blur-sm py-6 px-10 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 group/footer">
            <div className="flex items-center gap-4">
                <div className="w-10 h-[2px] bg-indigo-500 group-hover/footer:w-16 transition-all duration-700" />
                <p className="text-[11px] font-black uppercase  text-foreground/70 group-hover/footer:text-foreground transition-colors">
                    Movimiento Misionero Mundial
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 bg-indigo-500/5 px-4 py-2 rounded-2xl border border-indigo-500/10">
                    <span className="text-[9px] font-bold text-muted uppercase  opacity-60">Lead Architect</span>
                    <span className="text-[11px] font-black text-indigo-400 uppercase ">Lincol E.H</span>
                </div>

                <div className="h-6 w-[1px] bg-card-border hidden md:block" />

                <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black text-muted uppercase ">
                        © 2026
                    </p>
                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-[10px] font-black text-foreground/50 uppercase ">LiveOPS Core</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
