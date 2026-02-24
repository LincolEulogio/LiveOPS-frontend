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
    AlertTriangle, Play, Bell, History
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

    // Pass direct ID to useIntercom to ensure it identifies correctly
    const { sendCommand, sendDirectMessage, members: onlineMembers } = useIntercom();
    const { history } = useIntercomStore();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<'intercom' | 'automation' | 'multicast' | 'logs' | 'templates'>('intercom');

    // Fetch Production Data (including registered users)
    const { data: production } = useQuery<Production>({
        queryKey: ['production', activeProductionId],
        queryFn: async () => {
            return apiClient.get<Production>(`/productions/${activeProductionId}`);
        },
        enabled: !!activeProductionId,
    });

    // Fetch Templates - Use activeProductionId which is stabilized by params
    const { templates = [] } = useIntercomTemplates(activeProductionId);

    // Merge registered users with online status
    const crewMembers = useMemo<CrewMember[]>(() => {
        if (!production?.users) return [];

        return (production.users || []).map((pu) => {
            const isOnline = onlineMembers.some(m => m.userId === pu.user.id);
            const onlineData = onlineMembers.find(m => m.userId === pu.user.id);

            // Find last activity in history for this user
            const latestForUser = history
                .filter(h => h.id.includes(pu.user.id) || h.senderName === pu.user.name) // Rough filter, better if we had specific IDs
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

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
    }, [production, onlineMembers, history]);

    const handleMassAlert = (message: string) => {
        sendCommand({
            message,
            requiresAck: true
        });
    };

    // DEBUG: Log templates to verify they are arriving
    useEffect(() => {
        console.log(`[DashboardView] Current templates count: ${templates.length}`, templates);
    }, [templates]);

    return (
        <div className="space-y-6 max-w-[1800px] mx-auto pb-20 mt-4">
            {/* Top Operational Bar */}
            <div className="bg-card-bg/80 backdrop-blur-xl border border-card-border rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                        <Radio size={24} className="text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-foreground uppercase tracking-tighter leading-none">Control Operacional</h1>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Gestión técnica y de personal en tiempo real</p>
                    </div>
                </div>

                <div className="hidden lg:block border-l border-card-border h-10 mx-2" />

                <div className="flex-1 flex justify-center max-w-sm gap-4">
                    <ProductionSelector />
                    <div className="h-10 w-px bg-card-border hidden md:block" />
                    <div className="flex bg-background p-1 rounded-2xl border border-card-border">
                        {[
                            { label: 'Comms', id: 'intercom' },
                            { label: 'Automation', id: 'automation' },
                            { label: 'Multicast', id: 'multicast' },
                            { label: 'Logs', id: 'logs' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id ? "bg-card-border text-indigo-400 shadow-inner" : "text-muted hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <TemplateManager productionId={activeProductionId} />

                    <button
                        onClick={() => window.open(`/productions/${activeProductionId}/talent`, '_blank')}
                        className="px-5 py-2.5 bg-card-bg hover:bg-card-border/50 text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-card-border flex items-center gap-2"
                    >
                        <ExternalLink size={14} />
                        TALENT VIEW
                    </button>
                    <button
                        onClick={() => handleMassAlert('TODO READY')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        TODO READY
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                await apiClient.post(`/productions/${activeProductionId}/automation/instant-clip`);
                                // Toast or notification here would be nice
                            } catch (e) {
                                console.error('Failed to trigger instant clip', e);
                            }
                        }}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-500/20 flex items-center gap-2"
                        title="Capturar últimos 30 segundos"
                    >
                        <Scissors size={14} />
                        CLIP
                    </button>
                    <button
                        onClick={() => handleMassAlert('AL AIRE')}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-600/20 flex items-center gap-2"
                    >
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        FULL LIVE
                    </button>
                </div>
            </div>

            {/* Mass Alert Quick Access Bar */}
            <div className="bg-card-bg/40 border border-card-border/50 rounded-2xl p-2.5 flex items-center gap-3 overflow-x-auto custom-scrollbar">
                <div className="flex items-center gap-2 px-3 border-r border-card-border mr-1 shrink-0">
                    <Zap size={14} className="text-muted" />
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap">Global Alerts</span>
                </div>
                {templates.length > 0 ? templates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => handleMassAlert(t.name)}
                        className="shrink-0 px-4 py-2 bg-background hover:bg-card-bg border border-card-border hover:border-indigo-500/50 rounded-xl text-[10px] font-black text-foreground/70 hover:text-foreground uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 shadow-sm"
                    >
                        {t.name}
                    </button>
                )) : (
                    <span className="shrink-0 text-[10px] font-bold text-muted uppercase tracking-widest px-4 italic">Sin plantillas configuradas</span>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Switcher Area */}
                <div className="xl:col-span-3 space-y-6">

                    {/* Content based on activeTab */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'intercom' ? (
                            <motion.div
                                key="intercom"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
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
                                    <div className="col-span-full py-20 text-center bg-card-bg/50 border border-dashed border-card-border rounded-3xl">
                                        <Users size={48} className="text-muted mx-auto mb-4" />
                                        <p className="text-muted font-bold uppercase tracking-widest text-xs">No hay usuarios registrados en esta producción</p>
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
                                <div className="bg-card-bg/50 border border-card-border rounded-3xl p-6 shadow-2xl">
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

                {/* Right Area: Timeline & Logs */}
                <div className="xl:col-span-1 space-y-6 flex flex-col h-fit sticky top-6 pb-10">
                    {/* Escaleta Card */}
                    <div className="bg-card-bg/50 border border-card-border rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[450px]">
                        <TimelineView />
                    </div>

                    {/* Activity Log Card */}
                    <div className="bg-card-bg/50 border border-card-border rounded-3xl flex flex-col shadow-2xl overflow-hidden h-[300px]">
                        <div className="p-4 border-b border-card-border bg-background/20 flex items-center justify-between">
                            <h2 className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                <Clock size={14} className="text-indigo-400" /> Historial Log
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {history.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted/40 text-center p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">Sin actividad registrada</p>
                                    </div>
                                ) : (
                                    history.slice(0, 50).map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-background border border-card-border p-3 rounded-xl group relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[8px] font-black text-muted uppercase tracking-widest">
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h4 className="text-[10px] font-bold text-foreground uppercase tracking-tight line-clamp-2">{item.message}</h4>
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-1 opacity-60"
                                                style={{ backgroundColor: item.color }}
                                            />
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Health Monitor Card */}
                    <HealthMonitor productionId={activeProductionId || ''} />
                </div>
            </div>
        </div>
    );
};
