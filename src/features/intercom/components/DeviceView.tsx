'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
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
    const [tallyState, setTallyState] = useState<'IDLE' | 'PREVIEW' | 'PROGRAM'>('IDLE');

    // Derived values
    const { socket, isConnected } = useSocket();
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
            Swal.fire({
                icon: 'success',
                title: '¡Listo!',
                text: '¡Notificaciones activadas!',
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al activar notificaciones: ${result.error}`,
                confirmButtonText: 'Entendido',
            });
        }
    };

    // Listen for Tally updates from the engine
    React.useEffect(() => {
        if (!socket) return;
        const handleTally = (data: { targetUserId: string, state: 'IDLE' | 'PREVIEW' | 'PROGRAM' }) => {
            if (data.targetUserId === user?.id) {
                setTallyState(data.state);
                if (data.state === 'PROGRAM' && navigator.vibrate) {
                    navigator.vibrate(200); // Haptic feedback when going ON AIR
                }
            }
        };
        socket.on('tally_state_changed', handleTally);
        return () => {
            socket.off('tally_state_changed', handleTally);
        };
    }, [socket, user]);

    // Tally Styles
    const getTallyStyles = () => {
        if (tallyState === 'PROGRAM') return 'ring-8 ring-inset ring-red-600 shadow-[inset_0_0_100px_rgba(220,38,38,0.5)]';
        if (tallyState === 'PREVIEW') return 'ring-8 ring-inset ring-green-500 shadow-[inset_0_0_100px_rgba(34,197,94,0.5)]';
        return '';
    };

    if (!activeAlert) {
        return (
            <div className={`transition-all duration-300 min-h-[85vh] ${getTallyStyles()}`}>
                {tallyState !== 'IDLE' && (
                    <div className={`w-full py-2 text-center text-white font-black uppercase tracking-widest text-sm animate-pulse ${tallyState === 'PROGRAM' ? 'bg-red-600' : 'bg-green-600'}`}>
                        {tallyState === 'PROGRAM' ? 'EN VIVO (PROGRAMA)' : 'PREVENIDO (PREVIO)'}
                    </div>
                )}
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
                    productionId={activeProductionId || ''}
                />
            </div>
        );
    }

    return (
        <div className={`transition-all duration-300 min-h-[85vh] ${getTallyStyles()}`}>
            <DeviceAlertView
                activeAlert={activeAlert}
                activeRole={activeRole}
                onAcknowledge={acknowledgeAlert}
            />
        </div>
    );
};
