'use client';

import React from 'react';
import { Zap, X, LogOut, User as UserIcon, Server, Users, Shield, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { Guard } from '@/shared/components/Guard';
import NextLink from 'next/link';

interface SidebarProps {
    pathname: string;
    activeProductionId: string | null;
    user: any;
    handleLogout: () => Promise<void>;
    isMobile?: boolean;
    onCloseMobile?: () => void;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({
    pathname,
    activeProductionId,
    user,
    handleLogout,
    isMobile,
    onCloseMobile,
}) => {
    const sidebarContent = (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Logo/Header - Fixed */}
            <div className="h-20 flex items-center justify-between px-8 border-b border-card-border/50 bg-white/[0.02] shrink-0">
                <NextLink href="/productions" className="flex items-center gap-3 group/logo">
                    <div className="w-10 h-10 bg-indigo-600 group-hover:bg-indigo-500 rounded-xl flex items-center justify-center transition-all group-hover:scale-110">
                        <Zap size={22} className="text-white" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-foreground er uppercase italic leading-none">LiveOPS</h1>
                        <p className="text-[8px] font-black text-indigo-400 uppercase  mt-1 opacity-60">Control Surface</p>
                    </div>
                </NextLink>
                {isMobile && (
                    <button
                        onClick={onCloseMobile}
                        className="p-2 text-muted hover:text-foreground transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* Links - Scrollable */}
            <nav className="flex-1 overflow-y-auto py-8 px-5 space-y-2 custom-scrollbar min-h-0">
                <p className="px-4 text-[9px] font-black text-muted uppercase  mb-4 opacity-40">Core Systems</p>

                <SidebarLink
                    href="/productions"
                    icon={Server}
                    label="Productions"
                    active={pathname === '/productions' || (pathname.startsWith('/productions/') && !pathname.includes('intercom') && !pathname.includes('overlays') && !pathname.includes('guest'))}
                />

                <SidebarLink
                    href={activeProductionId ? `/productions/${activeProductionId}/intercom` : '/productions'}
                    icon={Zap}
                    label="Operational Hub"
                    active={pathname.includes('/intercom')}
                />

                {activeProductionId && (
                    <>
                        <div className="h-4" />
                        <p className="px-4 text-[9px] font-black text-muted uppercase  mb-4 opacity-40">Active Engine</p>
                        <SidebarLink
                            href={`/productions/${activeProductionId}/overlays`}
                            icon={Layers}
                            label="Graphics Engine"
                            active={pathname.includes('/overlays')}
                        />
                        <SidebarLink
                            href={`/productions/${activeProductionId}/guest`}
                            icon={Users}
                            label="Guest Panel"
                            active={pathname.includes('/guest')}
                        />
                    </>
                )}

                <div className="h-4" />
                <p className="px-4 text-[9px] font-black text-muted uppercase  mb-4 opacity-40">Identity</p>
                <SidebarLink
                    href="/profile"
                    icon={UserIcon}
                    label="Operator Profile"
                    active={pathname === '/profile'}
                />

                <Guard requiredPermissions={['user:manage', 'role:manage']}>
                    <div className="h-8" />
                    <p className="px-4 text-[9px] font-black text-indigo-400 uppercase  mb-4 opacity-60">Administration</p>

                    <Guard requiredPermissions={['user:manage']}>
                        <SidebarLink
                            href="/admin/users"
                            icon={Users}
                            label="Global Users"
                            active={pathname.startsWith('/admin/users')}
                        />
                    </Guard>

                    <Guard requiredPermissions={['role:manage']}>
                        <SidebarLink
                            href="/admin/roles"
                            icon={Shield}
                            label="Permissions Matrix"
                            active={pathname.startsWith('/admin/roles')}
                        />
                    </Guard>
                </Guard>
            </nav>

            {/* Profile/Logout - Fixed */}
            <div className="p-6 bg-white/[0.03] border-t border-card-border/50 shrink-0">
                <div className="p-4 bg-background/60 backdrop-blur-md rounded-2xl border border-card-border/60 flex items-center gap-4 mb-4 relative overflow-hidden group/user">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-600/20" />
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-lg font-black text-white shrink-0 group-hover/user:scale-110 transition-all">
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-foreground truncate er uppercase leading-none mb-1">{user?.name || 'Operator'}</p>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[9px] font-bold text-muted truncate uppercase ">{user?.globalRole?.name || 'Authorized'}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-5 py-4 text-muted hover:text-white hover:bg-red-600 rounded-2xl transition-all duration-300 group mb-2"
                >
                    <div className="flex items-center gap-3">
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        <span className="text-[12px] capitalize ">Terminate Session</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-muted/20 group-hover:bg-white" />
                </button>
            </div>
        </div>
    );

    if (isMobile) {
        return sidebarContent;
    }

    return (
        <aside className="w-[280px] border-r border-card-border bg-card-bg/40 backdrop-blur-2xl flex flex-col hidden lg:flex shrink-0 relative overflow-hidden group/sidebar h-screen">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            {sidebarContent}
        </aside>
    );
};

const SidebarLink = ({ href, icon: Icon, label, active }: any) => (
    <NextLink
        href={href}
        className={cn(
            "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group/link relative overflow-hidden",
            active
                ? "bg-indigo-600 text-white"
                : "text-muted hover:text-foreground hover:bg-white/5"
        )}
    >
        <div className="flex items-center gap-4 relative z-10">
            <Icon size={20} className={cn("transition-transform group-hover/link:scale-110", active ? "text-white" : "text-indigo-400")} />
            <span className="text-[12px] capitalize ">{label}</span>
        </div>
        {active && (
            <div className="w-1.5 h-1.5 rounded-full bg-white relative z-10" />
        )}
        {active && (
            <motion.div layoutId="nav-glow" className="absolute inset-0 bg-white/10" />
        )}
    </NextLink>
);
