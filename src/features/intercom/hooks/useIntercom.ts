import { useEffect, useCallback, useState } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAppStore } from '@/shared/store/app.store';
import { useIntercomStore, IntercomAlert } from '../store/intercom.store';

export const useIntercom = (forcedUserId?: string) => {
    const { socket, isConnected } = useSocket();
    const authUser = useAuthStore((state) => state.user);
    // Use forcedUserId if provided (for custom views), otherwise use logged in user
    const user = forcedUserId ? { id: forcedUserId, role: null, globalRole: null } : authUser;

    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const { setActiveAlert, addToHistory, updateAlertStatus } = useIntercomStore();
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handlePresence = (data: { members: any[] }) => {
            setMembers(data.members);
        };

        const handleCommand = (command: any) => {
            console.log(`[Intercom] Command received for production ${activeProductionId}:`, command);

            // Check if this command is for us
            const isTargeted = command.targetUserId
                ? (user?.id === command.targetUserId)
                : (!command.targetRoleId ||
                    (authUser?.globalRole?.id === command.targetRoleId) ||
                    (authUser?.role?.id === command.targetRoleId));

            console.log(`[Intercom] Target check (forcedId: ${forcedUserId}): matched=${isTargeted}. MyID=${user?.id}, TargetID=${command.targetUserId}`);

            if (isTargeted) {
                const alert: IntercomAlert = {
                    id: command.id,
                    message: command.message,
                    senderName: command.sender.name || 'Operator',
                    color: command.template?.color || '#3b82f6',
                    timestamp: command.createdAt,
                    requiresAck: command.requiresAck,
                    status: 'SENT',
                };

                setActiveAlert(alert);
                addToHistory(alert);

                if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
            }
        };

        const handleAck = (response: any) => {
            updateAlertStatus(response.commandId, 'ACKNOWLEDGED', new Date().toISOString());
        };

        socket.on('presence.update', handlePresence);
        socket.on('command.received', handleCommand);
        socket.on('command.ack_received', handleAck);

        return () => {
            socket.off('presence.update', handlePresence);
            socket.off('command.received', handleCommand);
            socket.off('command.ack_received', handleAck);
        };
    }, [socket, isConnected, user, setActiveAlert, addToHistory, updateAlertStatus]);

    const sendCommand = useCallback((data: {
        message: string;
        targetRoleId?: string;
        targetUserId?: string;
        templateId?: string;
        requiresAck?: boolean;
    }) => {
        if (!socket || !isConnected || !activeProductionId || !user) return;

        socket.emit('command.send', {
            productionId: activeProductionId,
            senderId: user.id,
            ...data
        });
    }, [socket, isConnected, activeProductionId, user]);

    const acknowledgeAlert = useCallback((alertId: string, responseType: string = 'OK') => {
        if (!socket || !isConnected || !activeProductionId || !user) return;

        socket.emit('command.ack', {
            commandId: alertId,
            responderId: user.id,
            response: `Ack: ${responseType}`,
            responseType,
            productionId: activeProductionId,
        });

        setActiveAlert(null);
    }, [socket, isConnected, activeProductionId, user, setActiveAlert]);

    return {
        sendCommand,
        acknowledgeAlert,
        members,
    };
};
