'use client';

import React from 'react';
import { Menu, Activity, Command } from 'lucide-react';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';
import { PresenceBar } from '@/shared/components/PresenceBar';

interface DashboardHeaderProps {
    pathname: string;
    onOpenMobileMenu: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ pathname, onOpenMobileMenu }) => {
    const getPageTitle = () => {
        if (pathname === '/productions') return 'Asset Management';
        if (pathname.includes('/intercom')) return 'Tactical Command';
        if (pathname.includes('/overlays')) return 'Visual Pipeline';
        if (pathname.includes('/social')) return 'Engagement Hub';
        if (pathname.includes('/automation')) return 'Logic Engine';
        return 'Production Core';
    };

    return (
        <header className="h-20 border-b border-card-border/40 bg-background/50 backdrop-blur-2xl z-30">
            <div className="max-w-[1800px] mx-auto h-full flex items-center justify-between px-6 lg:px-10">
                <div className="flex items-center gap-3 sm:gap-6">
                    <button
                        onClick={onOpenMobileMenu}
                        className="p-3 -ml-3 text-foreground lg:hidden hover:bg-white/5 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-card-border/50"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden lg:flex flex-col">
                        <div className="flex items-center gap-3">
                            <Activity size={14} className="text-indigo-400" />
                            <h2 className="text-[10px] font-black text-muted uppercase ">Operational Node</h2>
                        </div>
                        <h1 className="text-lg font-black text-foreground uppercase  mt-0.5">
                            {getPageTitle()}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 lg:gap-8">
                    <div className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl group cursor-default">
                        <Command size={14} className="text-muted group-hover:text-indigo-400 transition-colors" />
                        <span className="text-[10px] font-black text-muted uppercase ">K: Search Matrix</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <PresenceBar />
                        <div className="h-6 w-[1px] bg-card-border/50 hidden lg:block" />
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10 transition-all hover:bg-emerald-500/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500/80 uppercase ">Signal Stable</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
