'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Activity, Command, Video } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';
import { PresenceBar } from '@/shared/components/PresenceBar';
import { useSocket } from '@/shared/socket/socket.provider';

interface DashboardHeaderProps {
    pathname: string;
    onOpenMobileMenu: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ pathname, onOpenMobileMenu }) => {
    const router = useRouter();
    const { isConnected } = useSocket();

    const startNewCall = () => {
        if (pathname === '/video-calls') {
            window.dispatchEvent(new CustomEvent('open-new-call-modal'));
        } else {
            router.push(`/video-calls?new=1`);
        }
    };

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
                        <button
                            onClick={startNewCall}
                            title="Nueva videollamada"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-violet-500/8 border border-violet-500/20 rounded-xl text-violet-300/80 hover:bg-violet-500/15 hover:border-violet-500/35 hover:text-violet-200 transition-colors text-[10px] font-black uppercase tracking-wider"
                        >
                            <Video size={13} />
                            <span>Nueva Llamada</span>
                        </button>
                        <ThemeSwitcher />
                        <PresenceBar />
                        <div className="h-6 w-[1px] bg-card-border/50 hidden lg:block" />
                        <div className={cn(
                            "hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl border transition-all",
                            isConnected
                                ? "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10"
                                : "bg-red-500/5 border-red-500/10 animate-pulse hover:bg-red-500/10"
                        )}>
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                            )} />
                            <span className={cn(
                                "text-[10px] font-black uppercase ",
                                isConnected ? "text-emerald-500/80" : "text-red-500/80"
                            )}>
                                {isConnected ? 'Signal Stable' : 'Signal Lost'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
