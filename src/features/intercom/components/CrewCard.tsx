'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IntercomTemplate, CrewMember } from '@/features/intercom/types/intercom.types';
import { cn } from '@/shared/utils/cn';
import { useIntercomStore } from '@/features/intercom/store/intercom.store';
import { Mic } from 'lucide-react';

// New Sub-components
import { CrewCardHeader } from '@/features/intercom/components/crew-card/CrewCardHeader';
import { CrewCardIdentity } from '@/features/intercom/components/crew-card/CrewCardIdentity';
import { CrewCardStatus } from '@/features/intercom/components/crew-card/CrewCardStatus';
import { CrewCardCommandGrid } from '@/features/intercom/components/crew-card/CrewCardCommandGrid';
import { CrewCardChatFeed } from '@/features/intercom/components/crew-card/CrewCardChatFeed';
import { CrewCardChatInput } from '@/features/intercom/components/crew-card/CrewCardChatInput';

interface CrewCardProps {
    productionId: string;
    member: CrewMember;
    templates: IntercomTemplate[];
    onSendCommand: (template: IntercomTemplate) => void;
    onTalkStart?: () => void;
    onTalkStop?: () => void;
    isTalkingLocal?: boolean;
    audioLevel?: number;
}

export const CrewCard = ({
    productionId,
    member,
    templates,
    onSendCommand,
    onTalkStart,
    onTalkStop,
    isTalkingLocal,
    audioLevel
}: CrewCardProps) => {
    const history = useIntercomStore(state => state.history);

    // Filter chat history for this specific user
    const directHistory = history.filter(h => {
        const isMsg = h.message?.startsWith('Mensaje:');
        if (!isMsg) return false;
        const iSent = h.targetUserId === member.userId;
        const theySent = h.senderId === member.userId;
        return iSent || theySent;
    }).slice(0, 50);

    const currentStatus = (member.currentStatus || 'IDLE').toUpperCase();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "bg-card-bg/60 backdrop-blur-2xl border rounded-[2.5rem] overflow-hidden  transition-all duration-500 relative flex flex-col group",
                member.isOnline ? "border-card-border/60 hover:border-indigo-500/40" : "border-card-border/30 opacity-60 grayscale-[0.5]"
            )}
        >
            {/* Tactical Scanline */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CrewCardHeader
                productionId={productionId}
                userId={member.userId}
                isOnline={member.isOnline}
                isTalking={member.isTalking}
                audioLevel={audioLevel}
            />

            <CrewCardIdentity
                userName={member.userName}
                roleName={member.roleName}
                isOnline={member.isOnline}
                onTalkStart={onTalkStart}
                onTalkStop={onTalkStop}
                isTalkingLocal={isTalkingLocal}
            />

            <CrewCardStatus
                currentStatus={currentStatus}
                lastAck={member.lastAck}
            />

            <CrewCardCommandGrid
                templates={templates}
                isOnline={member.isOnline}
                currentStatus={currentStatus}
                onSendCommand={onSendCommand}
            />

            <CrewCardChatFeed
                directHistory={directHistory}
                memberUserId={member.userId}
                memberUserName={member.userName}
            />

            <CrewCardChatInput
                memberUserId={member.userId}
                memberUserName={member.userName}
                isOnline={member.isOnline}
                onSendCommand={onSendCommand}
            />
        </motion.div>
    );
};
