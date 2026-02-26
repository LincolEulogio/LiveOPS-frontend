'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useIntercom } from '@/features/intercom/hooks/useIntercom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { useAppStore } from '@/shared/store/app.store';
import { useIntercomStore } from '@/features/intercom/store/intercom.store';
import {
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrewCard } from '@/features/intercom/components/CrewCard';
import { AuditLogView } from '@/features/intercom/components/AuditLogView';
import { useIntercomTemplates } from '@/features/intercom/hooks/useIntercomTemplates';
import { AutomationDashboard } from '@/features/automation/components/AutomationDashboard';
import { MulticastManager } from '@/features/streaming/components/MulticastManager';
import { Production } from '@/features/productions/types/production.types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useWebRTC } from '@/features/intercom/hooks/useWebRTC';
import { CrewMember } from '@/features/intercom/types/intercom.types';

// New Sub-components
import { DashboardHeader } from '@/features/intercom/components/dashboard/DashboardHeader';
import { DashboardTabs } from '@/features/intercom/components/dashboard/DashboardTabs';
import { DashboardQuickActions } from '@/features/intercom/components/dashboard/DashboardQuickActions';
import { DashboardSidebar } from '@/features/intercom/components/dashboard/DashboardSidebar';

export const DashboardView = () => {
    const { id: productionIdFromParams } = useParams();
    const activeProductionId = (useAppStore((state) => state.activeProductionId) || productionIdFromParams) as string;
    const user = useAuthStore((state) => state.user);

    const { sendCommand, sendDirectMessage, members: onlineMembers } = useIntercom();
    const { history } = useIntercomStore();
    const [activeTab, setActiveTab] = useState<'intercom' | 'automation' | 'multicast' | 'logs' | 'templates'>('intercom');

    const { startTalking, stopTalking, isTalking, initiateCall, talkingUsers, talkingInfo } = useWebRTC({
        productionId: activeProductionId,
        userId: user?.id || 'admin',
        isHost: true,
    });

    const initiatedMembers = React.useRef<Set<string>>(new Set());

    // We can initiate auto-call to all members when they are online or just allow PTT broadcasting
    React.useEffect(() => {
        onlineMembers.forEach(m => {
            if (!initiatedMembers.current.has(m.userId)) {
                initiateCall(m.userId);
                initiatedMembers.current.add(m.userId);
            }
        });

        // Cleanup initiated members who are no longer online
        const onlineIds = new Set(onlineMembers.map(m => m.userId));
        initiatedMembers.current.forEach(id => {
            if (!onlineIds.has(id)) {
                initiatedMembers.current.delete(id);
            }
        });
    }, [onlineMembers, initiateCall]);

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
                isTalking: talkingUsers.has(pu.user.id),
                currentStatus: onlineData?.status || 'IDLE',
                lastAck: (onlineData?.status && onlineData.status.startsWith('ACK:')) ? {
                    message: onlineData.status.substring(4),
                    timestamp: new Date().toISOString(),
                    type: onlineData.status.substring(4)
                } : undefined
            };
        });
    }, [production, onlineMembers, talkingUsers, talkingInfo]);

    const handleMassAlert = (message: string) => {
        sendCommand({
            message,
            requiresAck: true
        });
    };

    return (
        <div className="space-y-3 sm:space-y-4 max-w-[1800px] mx-auto pb-24 mt-0 sm:mt-4 px-2 sm:px-4">

            <DashboardHeader
                production={production}
                activeProductionId={activeProductionId}
                onMassAlert={handleMassAlert}
            />

            <DashboardTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* Bento Grid Architecture */}
            <div className="grid grid-cols-1 min-[1280px]:grid-cols-12 gap-4 sm:gap-8 items-start">

                {/* Protocol Area (Main Deck) */}
                <div className="min-[1280px]:col-span-8 min-[1440px]:col-span-9 space-y-4 sm:space-y-6 min-h-[400px]">
                    {activeTab === 'intercom' && (
                        <DashboardQuickActions
                            templates={templates}
                            onMassAlert={handleMassAlert}
                            startTalking={startTalking}
                            stopTalking={stopTalking}
                            isTalking={isTalking}
                        />
                    )}

                    <AnimatePresence mode="wait">
                        {activeTab === 'intercom' ? (
                            <motion.div
                                key="intercom"
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 min-[1600px]:grid-cols-3 gap-4 sm:gap-6 xl:gap-8"
                            >
                                {crewMembers.map((member) => (
                                    <CrewCard
                                        key={member.userId}
                                        productionId={activeProductionId || ''}
                                        member={member}
                                        templates={templates}
                                        onTalkStart={() => startTalking(member.userId)}
                                        onTalkStop={() => stopTalking(member.userId)}
                                        isTalkingLocal={isTalking && talkingInfo?.targetUserId === member.userId}
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
                                    <div className="col-span-full py-20 sm:py-40 text-center bg-white/[0.02] border border-dashed border-card-border rounded-[2rem] sm:rounded-[3rem] flex flex-col items-center justify-center gap-4 sm:gap-6 opacity-40">
                                        <Users size={48} strokeWidth={1} className="text-muted sm:size-64" />
                                        <div className="px-6">
                                            <p className="text-[10px] font-black text-muted uppercase mb-2 leading-none">Matrix Unpopulated</p>
                                            <p className="text-[8px] font-bold text-muted uppercase">No operators are currently bound to this production segment</p>
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
                                <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2rem] sm:rounded-[3rem] p-6 md:p-12 min-h-[500px]">
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

                <DashboardSidebar
                    productionId={activeProductionId}
                    history={history}
                />
            </div>
        </div>
    );
};
