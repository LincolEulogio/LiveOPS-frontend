'use client';

import React, { useState, useMemo } from 'react';
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
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrewCard } from './CrewCard';
import { ProductionSelector } from '@/features/productions/components/ProductionSelector';
import { TimelineView } from '../../timeline/components/TimelineView';
import { TemplateManager } from './TemplateManager';
import { useIntercomTemplates } from '../hooks/useIntercomTemplates';
import { AutomationDashboard } from '../../automation/components/AutomationDashboard';
import { cn } from '@/shared/utils/cn';

export const DashboardView = () => {
    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const { sendCommand, members: onlineMembers } = useIntercom();
    const { history } = useIntercomStore();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<'intercom' | 'automation'>('intercom');

    // Fetch Production Data (including registered users)
    const { data: production } = useQuery<any>({
        queryKey: ['production', activeProductionId],
        queryFn: async () => {
            const data = await (apiClient.get(`/productions/${activeProductionId}`) as any);
            return data;
        },
        enabled: !!activeProductionId,
    });

    // Fetch Templates
    const { templates = [] } = useIntercomTemplates(activeProductionId || undefined);

    // Merge registered users with online status
    const crewMembers = useMemo(() => {
        if (!production?.users) return [];

        return production.users.map((pu: any) => {
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
                lastAck: (onlineData?.status && onlineData.status.startsWith('OK:')) ? {
                    message: onlineData.status,
                    timestamp: new Date().toISOString(),
                    type: 'OK'
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

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
            {/* Top Operational Bar */}
            <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                        <Radio size={24} className="text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Control Operacional</h1>
                        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">Gestión técnica y de personal en tiempo real</p>
                    </div>
                </div>

                <div className="hidden lg:block border-l border-stone-800 h-10 mx-2" />

                <div className="flex-1 flex justify-center max-w-sm gap-4">
                    <ProductionSelector />
                    <div className="h-10 w-px bg-stone-800 hidden md:block" />
                    <div className="flex bg-stone-950 p-1 rounded-2xl border border-stone-800">
                        <button
                            onClick={() => setActiveTab('intercom')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'intercom' ? "bg-stone-800 text-indigo-400 shadow-inner" : "text-stone-500 hover:text-stone-300"
                            )}
                        >
                            Comms
                        </button>
                        <button
                            onClick={() => setActiveTab('automation')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'automation' ? "bg-stone-800 text-indigo-400 shadow-inner" : "text-stone-500 hover:text-stone-300"
                            )}
                        >
                            Automation
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <TemplateManager />
                    <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-stone-800 text-white shadow-inner' : 'text-stone-600 hover:text-stone-400'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-stone-800 text-white shadow-inner' : 'text-stone-600 hover:text-stone-400'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
                        TODO READY
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

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Switcher Area */}
                <div className="xl:col-span-3 space-y-6">

                    {/* Crew Grid */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'intercom' ? (
                            <motion.div
                                key="intercom"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6"
                            >
                                {crewMembers.map((member: any) => (
                                    <CrewCard
                                        key={member.userId}
                                        productionId={activeProductionId || ''}
                                        member={member}
                                        templates={templates}
                                        onSendCommand={(t) => sendCommand({
                                            message: t.name,
                                            templateId: t.id,
                                            targetUserId: member.userId,
                                            targetRoleId: production?.users.find((pu: any) => pu.userId === member.userId)?.roleId,
                                            requiresAck: true
                                        })}
                                    />
                                ))}
                                {crewMembers.length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-stone-900/30 border border-dashed border-stone-800 rounded-3xl">
                                        <Users size={48} className="text-stone-700 mx-auto mb-4" />
                                        <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">No hay usuarios registrados en esta producción</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="automation"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <AutomationDashboard productionId={activeProductionId || ''} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Area: Timeline & Logs */}
                <div className="xl:col-span-1 space-y-6 flex flex-col h-fit sticky top-6 pb-10">
                    {/* Escaleta Card */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[450px]">
                        <TimelineView />
                    </div>

                    {/* Activity Log Card */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden h-[300px]">
                        <div className="p-4 border-b border-stone-800 bg-stone-950/20 flex items-center justify-between">
                            <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={14} className="text-indigo-400" /> Historial Log
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {history.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-stone-700 text-center p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">Sin actividad registrada</p>
                                    </div>
                                ) : (
                                    history.slice(0, 50).map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-stone-950/50 border border-stone-800 p-3 rounded-xl group relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[8px] font-black text-stone-600 uppercase tracking-widest">
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h4 className="text-[10px] font-bold text-white uppercase tracking-tight line-clamp-2">{item.message}</h4>
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
                </div>
            </div>
        </div>
    );
};
