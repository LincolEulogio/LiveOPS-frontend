'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useIntercom } from '../hooks/useIntercom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { useAppStore } from '@/shared/store/app.store';
import { useIntercomStore } from '../store/intercom.store';
import {
    Users,
    MessageSquare,
    Clock,
    Search,
    Filter,
    LayoutGrid,
    List,
    Zap,
    Settings,
    CheckCircle2,
    AlertCircle,
    Radio,
    ShieldAlert,
    ExternalLink,
    Scissors,
    AlertTriangle, Play, Bell, History, Activity, ShieldCheck, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrewCard } from './CrewCard';
import { AuditLogView } from './AuditLogView';
import { ProductionSelector } from '@/features/productions/components/ProductionSelector';
import { TimelineView } from '../../timeline/components/TimelineView';
import { TemplateManager } from './TemplateManager';
import { useIntercomTemplates } from '../hooks/useIntercomTemplates';
import { AutomationDashboard } from '../../automation/components/AutomationDashboard';
import { MulticastManager } from '../../streaming/components/MulticastManager';
import { cn } from '@/shared/utils/cn';
import { HealthMonitor } from '../../health/components/HealthMonitor';
import { IntercomTemplate, CrewMember } from '../types/intercom.types';
import { Production } from '@/features/productions/types/production.types';

export const DashboardView = () => {
    const router = useRouter();
    const { id: productionIdFromParams } = useParams();
    const activeProductionId = (useAppStore((state) => state.activeProductionId) || productionIdFromParams) as string;

    const { sendCommand, sendDirectMessage, members: onlineMembers } = useIntercom();
    const { history } = useIntercomStore();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<'intercom' | 'automation' | 'multicast' | 'logs' | 'templates'>('intercom');

    const { data: production } = useQuery<Production>({
        queryKey: ['production', activeProductionId],
        queryFn: async () => {
            return apiClient.get<Production>(`/productions/${activeProductionId}`);
        },
        enabled: !!activeProductionId,
    });

    const { templates = [] } = useIntercomTemplates(activeProductionId);

    const crewMembers = useMemo<CrewMember[]>(() => {
        if (!production?.users) return [];

        return (production.users || []).map((pu) => {
            const isOnline = onlineMembers.some(m => m.userId === pu.user.id);
            const onlineData = onlineMembers.find(m => m.userId === pu.user.id);

            return {
                userId: pu.user.id,
                userName: pu.user.name,
                roleName: pu.role.name,
                isOnline,
                currentStatus: onlineData?.status || 'IDLE',
                lastAck: (onlineData?.status && onlineData.status.startsWith('ACK:')) ? {
                    message: onlineData.status.substring(4),
                    timestamp: new Date().toISOString(),
                    type: onlineData.status.substring(4)
                } : undefined
            };
        });
    }, [production, onlineMembers]);

    const handleMassAlert = (message: string) => {
        sendCommand({
            message,
            requiresAck: true
        });
    };

    return (
        <div className="space-y-8 max-w-[1800px] mx-auto pb-20 mt-2 sm:mt-4">

            {/* Immersive Operational Header */}
            <div className="bg-card-bg/60 backdrop-blur-3xl border border-card-border rounded-[2.5rem] p-6 md:p-10 flex flex-col min-[1100px]:flex-row items-center justify-between gap-8  relative overflow-hidden group">
                {/* Tactical Scanline */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse" />

                <div className="flex items-center gap-6 w-full min-[1100px]:w-auto relative z-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center   border border-indigo-400/20 group-hover:rotate-3 transition-transform">
                        <Radio size={32} className="text-white animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <Activity size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-muted uppercase ">Signal Source Operational</span>
                        </div>
                        <h1 className="text-xl md:text-3xl font-black text-foreground uppercase er leading-tight break-words italic">
                            {production?.name || 'INITIALIZING NODE...'}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full min-[1100px]:w-auto justify-center min-[1100px]:justify-end relative z-10">
                    <div className="hidden xl:block mr-2 scale-90">
                        <TemplateManager productionId={activeProductionId} />
                    </div>

                    <button
                        onClick={() => window.open(`/productions/${activeProductionId}/talent`, '_blank')}
                        className="flex-1 sm:flex-none px-6 py-3.5 bg-background/50 hover:bg-white/5 text-muted hover:text-foreground rounded-2xl font-black text-[10px] uppercase  transition-all active:scale-95 border border-card-border flex items-center justify-center gap-3 "
                    >
                        <ExternalLink size={16} />
                        Talent Link
                    </button>

                    <button
                        onClick={() => handleMassAlert('TODO READY')}
                        className="flex-1 sm:flex-none px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase  transition-all active:scale-95  "
                    >
                        READY
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                await apiClient.post(`/productions/${activeProductionId}/automation/instant-clip`);
                            } catch (e) {
                                console.error('Failed to trigger instant clip', e);
                            }
                        }}
                        className="flex-1 sm:flex-none px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black text-[10px] uppercase  transition-all active:scale-95   flex items-center justify-center gap-3"
                    >
                        <Scissors size={18} />
                        CLIP
                    </button>

                    <button
                        onClick={() => handleMassAlert('AL AIRE')}
                        className="flex-1 sm:flex-none px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase  transition-all active:scale-95   flex items-center justify-center gap-3 group/live"
                    >
                        <div className="w-2 h-2 bg-white rounded-full animate-ping group-hover:scale-125 transition-transform" />
                        LIVE
                    </button>
                </div>
            </div>

            {/* Tactical Control Bar */}
            <div className="flex flex-col min-[1280px]:flex-row gap-6 items-start min-[1280px]:items-center">
                <div className="flex bg-card-bg/40 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-card-border w-full xl:w-auto overflow-x-auto no-scrollbar gap-1 ">
                    {[
                        { label: 'COMS', id: 'intercom', icon: Radio },
                        { label: 'AUTO', id: 'automation', icon: Zap },
                        { label: 'CAST', id: 'multicast', icon: Box },
                        { label: 'LOGS', id: 'logs', icon: History },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex-1 xl:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase  transition-all relative overflow-hidden",
                                activeTab === tab.id
                                    ? "bg-indigo-600 text-white  "
                                    : "text-muted hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={14} className={activeTab === tab.id ? "text-white" : "text-indigo-400"} />
                            <span className="whitespace-nowrap">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div layoutId="dash-tab-glow" className="absolute inset-0 bg-white/10" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="hidden xl:block h-12 w-[1px] bg-card-border/50" />

                <div className="flex-1 w-full xl:w-auto flex items-center justify-between xl:justify-start gap-6">
                    <ProductionSelector />

                    <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl group cursor-default">
                        <Search size={14} className="text-muted group-hover:text-indigo-400 transition-colors" />
                        <span className="text-[10px] font-black text-muted uppercase ">Global Capture: Cmd+K</span>
                    </div>
                </div>
            </div>

            {/* Matrix Quick Actions */}
            <div className="bg-card-bg/40 backdrop-blur-xl border border-card-border/60 rounded-[1.5rem] p-3 flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar  relative group/actions min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 border-r border-card-border shrink-0">
                    <Zap size={14} className="text-amber-400 animate-pulse" />
                    <span className="text-[8px] sm:text-[9px] font-black text-muted uppercase  sm: whitespace-nowrap">Rapid Response Intercepts</span>
                </div>
                <div className="flex items-center gap-3">
                    {templates.length > 0 ? templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleMassAlert(t.name)}
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

            {/* Bento Grid Architecture - Activating at XL (1280px+) for safe sidebar clearance */}
            <div className="grid grid-cols-1 min-[1280px]:grid-cols-12 gap-8 items-start">

                {/* Protocol Area (Main Deck) - Adaptive Bento Block */}
                <div className="min-[1280px]:col-span-8 min-[1440px]:col-span-9 space-y-8 min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'intercom' ? (
                            <motion.div
                                key="intercom"
                                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="grid grid-cols-1 sm:grid-cols-2 min-[1600px]:grid-cols-3 gap-6 xl:gap-8"
                            >
                                {crewMembers.map((member) => (
                                    <CrewCard
                                        key={member.userId}
                                        productionId={activeProductionId || ''}
                                        member={member}
                                        templates={templates}
                                        onSendCommand={(t) => {
                                            if (t.isChat) {
                                                sendDirectMessage({
                                                    message: t.name,
                                                    targetUserId: t.targetUserId || member.userId
                                                });
                                            } else {
                                                sendCommand({
                                                    message: t.name,
                                                    templateId: t.id,
                                                    targetUserId: member.userId,
                                                    targetRoleId: production?.users?.find(pu => pu.userId === member.userId)?.roleId,
                                                    requiresAck: true
                                                });
                                            }
                                        }}
                                    />
                                ))}
                                {crewMembers.length === 0 && (
                                    <div className="col-span-full py-40 text-center bg-white/[0.02] border border-dashed border-card-border rounded-[3rem] flex flex-col items-center justify-center gap-6 opacity-40">
                                        <Users size={64} strokeWidth={1} className="text-muted" />
                                        <div>
                                            <p className="text-xs font-black text-muted uppercase  mb-2">Matrix Unpopulated</p>
                                            <p className="text-[9px] font-bold text-muted uppercase ">No operators are currently bound to this production segment</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : activeTab === 'automation' ? (
                            <motion.div
                                key="automation"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <AutomationDashboard productionId={activeProductionId || ''} />
                            </motion.div>
                        ) : activeTab === 'multicast' ? (
                            <motion.div
                                key="multicast"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[3rem] p-8 md:p-12  min-h-[500px]">
                                    <MulticastManager productionId={activeProductionId || ''} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="logs"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <AuditLogView productionId={activeProductionId || ''} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Intelligence Sidebar - Sticky Bento Blocks */}
                <div className="min-[1280px]:col-span-4 min-[1440px]:col-span-3 space-y-8 flex flex-col h-fit min-[1280px]:sticky min-[1280px]:top-8 pb-10">

                    {/* Rundown Protocol Card */}
                    <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[3rem] overflow-hidden  flex flex-col h-[450px] sm:h-[500px] group/rundown relative">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover/rundown:scale-110 transition-transform duration-1000">
                            <List size={120} />
                        </div>
                        <TimelineView />
                    </div>

                    {/* Operational Feed Log - Scaled for Bento */}
                    <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[3rem] flex flex-col  overflow-hidden h-[400px] min-[1440px]:h-[450px] relative">
                        <div className="p-6 border-b border-card-border/50 bg-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-indigo-400" />
                                <h2 className="text-[10px] font-black text-foreground uppercase ">Operational Flux</h2>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse " />
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar no-scrollbar bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:24px_24px]">
                            <AnimatePresence initial={false} mode="popLayout">
                                {history.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted/30 text-center space-y-4">
                                        <History size={32} strokeWidth={1} />
                                        <p className="text-[9px] font-black uppercase  italic">No active telemetry</p>
                                    </div>
                                ) : (
                                    history.slice(0, 30).map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-background/60 border border-card-border/60 p-4 rounded-2xl group/log relative overflow-hidden transition-all hover:border-indigo-500/20"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[8px] font-black text-muted uppercase  opacity-40">
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-indigo-500/20 group-hover/log:bg-indigo-500 transition-colors" />
                                            </div>
                                            <h4 className="text-[10px] font-bold text-foreground/90 uppercase  leading-relaxed">{item.message}</h4>
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-1 opacity-40"
                                                style={{ backgroundColor: item.color }}
                                            />
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-4 bg-white/5 border-t border-card-border/30 flex justify-center">
                            <div className="flex items-center gap-2 opacity-30">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                <span className="text-[8px] font-black uppercase ">Encrypted Log Stream</span>
                            </div>
                        </div>
                    </div>

                    {/* Telemetry Integrity Monads */}
                    <div className="hover:scale-[1.02] transition-transform duration-500  rounded-[3rem]">
                        <HealthMonitor productionId={activeProductionId || ''} />
                    </div>
                </div>
            </div>
        </div >
    );
};
