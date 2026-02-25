'use client';

import React, { useState } from 'react';
import { useIntercomStore } from '@/features/intercom/store/intercom.store';
import { useIntercom } from '@/features/intercom/hooks/useIntercom';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSocket } from '@/shared/socket/socket.provider';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { useAppStore } from '@/shared/store/app.store';
import { TimelineBlock } from '@/features/timeline/types/timeline.types';

// New Sub-components
import { DeviceIdleView } from '@/features/intercom/components/device/DeviceIdleView';
import { DeviceAlertView } from '@/features/intercom/components/device/DeviceAlertView';

export const DeviceView = () => {
    const { activeAlert, history } = useIntercomStore();
    const { acknowledgeAlert, sendDirectMessage } = useIntercom();
    const user = useAuthStore((state) => state.user);
    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const [customMessage, setCustomMessage] = useState('');

    // Derived values
    const { isConnected } = useSocket();
    const activeRole = user?.role?.name || user?.globalRole?.name || 'OPERATOR';
    const { subscribeToPush } = usePushNotifications();

    // Fetch timeline blocks to know the current active segment
    const { data: timelineBlocks = [] } = useQuery<TimelineBlock[]>({
        queryKey: ['timeline', activeProductionId],
        queryFn: async () => {
            if (!activeProductionId) return [];
            return await apiClient.get<TimelineBlock[]>(`/productions/${activeProductionId}/timeline`);
        },
        enabled: !!activeProductionId,
    });

    // Find the currently active block
    const activeBlock = timelineBlocks.find((b) => b.status === 'ACTIVE');

    // Filter history to ONLY show chat messages (WhatsApp style) and not commands/alerts
    const userHistory = history.filter(h =>
        h.message?.startsWith('Mensaje:')
    ).slice(0, 15);

    const handleSendCustomMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customMessage.trim()) return;

        // Extract last coordinator ID
        const chatMsgs = history.filter(h => h.message.startsWith('Mensaje:') && h.senderId !== user?.id);
        const lastTargetUserId = chatMsgs.length > 0 ? chatMsgs[0].senderId : undefined;

        if (lastTargetUserId) {
            sendDirectMessage({
                message: `Mensaje: ${customMessage.trim()}`,
                targetUserId: lastTargetUserId,
            });
        }
        setCustomMessage('');
    };

    const handleSubscribePush = async () => {
        const result = await subscribeToPush();
        if (result.success) {
            alert('¡Notificaciones activadas!');
        } else {
            alert(`Error al activar notificaciones: ${result.error}`);
        }
    };

    if (!activeAlert) {
        return (
            <DeviceIdleView
                isConnected={isConnected}
                activeRole={activeRole}
                activeBlock={activeBlock}
                userHistory={userHistory}
                user={user}
                customMessage={customMessage}
                setCustomMessage={setCustomMessage}
                onSendCustomMessage={handleSendCustomMessage}
                onSubscribePush={handleSubscribePush}
            />
        );
    }

    return (
        <DeviceAlertView
            activeAlert={activeAlert}
            activeRole={activeRole}
            onAcknowledge={acknowledgeAlert}
        />
    );
};
