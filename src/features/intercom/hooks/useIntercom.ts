import { useEffect, useCallback, useState } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAppStore } from '@/shared/store/app.store';
import { useIntercomStore, IntercomAlert } from '../store/intercom.store';
import { useAudio } from '@/shared/providers/AudioProvider';

export const useIntercom = (forcedUserId?: string) => {
    const { socket, isConnected } = useSocket();
    const { playAlert } = useAudio();
    const authUser = useAuthStore((state) => state.user);
    // Use forcedUserId if provided (for custom views), otherwise use logged in user
    const user = forcedUserId ? { id: forcedUserId, role: null, globalRole: null } : authUser;

    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const { setActiveAlert, addToHistory, updateAlertStatus } = useIntercomStore();
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        if (!socket || !isConnected || !user || !activeProductionId) return;

        // Force identify on connect or change
        socket.emit('user.identify', {
            productionId: activeProductionId,
            userId: user.id,
            userName: authUser?.name || 'User',
            roleId: authUser?.role?.id || authUser?.globalRole?.id || '',
            roleName: authUser?.role?.name || authUser?.globalRole?.name || 'Viewer',
        });

        const handlePresence = (data: { members: any[] }) => {
            setMembers(data.members);
        };

        const handleCommand = (command: any) => {
            // Improved targeting logic
            const isTargeted = command.targetUserId
                ? (user?.id === command.targetUserId)
                : (!command.targetRoleId ||
                    (authUser?.globalRole?.id === command.targetRoleId) ||
                    (authUser?.role?.id === command.targetRoleId));

            const isMeSender = command.senderId === user?.id;

            if (isTargeted && !isMeSender) {
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
                playAlert();

                if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
            } else if (isMeSender) {
                // If I am the sender, just add to history without playing alert
                const alert: IntercomAlert = {
                    id: command.id,
                    message: command.message,
                    senderName: 'Yo',
                    color: command.template?.color || '#3b82f6',
                    timestamp: command.createdAt,
                    requiresAck: command.requiresAck,
                    status: 'SENT',
                };
                addToHistory(alert);
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
    }, [socket, isConnected, user?.id, activeProductionId, setActiveAlert, addToHistory, updateAlertStatus, authUser]);

    const sendCommand = useCallback((data: {
        message: string;
        targetRoleId?: string;
        targetUserId?: string;
        templateId?: string;
        requiresAck?: boolean;
    }) => {
        if (!socket || !isConnected || !activeProductionId || !user) {
            console.error('[Intercom] Cannot send command: Missing context', {
                hasSocket: !!socket,
                isConnected,
                activeProductionId,
                hasUser: !!user
            });
            return;
        }

        console.log(`[Intercom] Emitting command: ${data.message} to production ${activeProductionId}`, data);
        socket.emit('command.send', {
            productionId: activeProductionId,
            senderId: user.id,
            ...data
        });
    }, [socket, isConnected, activeProductionId, user]);

    const acknowledgeAlert = useCallback((alertId: string, responseType: string = 'OK') => {
        if (!socket || !isConnected || !activeProductionId || !user) {
            console.error('[Intercom] Cannot acknowledge alert: missing context', { isConnected, activeProductionId, hasUser: !!user });
            return;
        }

        console.log(`[Intercom] Acknowledging alert ${alertId} with ${responseType} for user ${user.id}`);

        socket.emit('command.ack', {
            commandId: alertId,
            responderId: user.id,
            response: `Ack: ${responseType}`,
            responseType,
            productionId: activeProductionId,
        });

        setActiveAlert(null);
    }, [socket, isConnected, activeProductionId, user?.id, setActiveAlert]);

    return {
        sendCommand,
        acknowledgeAlert,
        members,
    };
};
