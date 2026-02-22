'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/shared/socket/socket.provider';
import { useAppStore } from '@/shared/store/app.store';

export interface PresenceMember {
    userId: string;
    userName: string;
    roleId: string;
    roleName: string;
    lastSeen: string;
    status: string;
}

export const usePresence = () => {
    const { socket, isConnected } = useSocket();
    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const [members, setMembers] = useState<PresenceMember[]>([]);

    useEffect(() => {
        if (!socket || !isConnected || !activeProductionId) return;

        const handlePresenceUpdate = (data: { members: PresenceMember[] }) => {
            setMembers(data.members);
        };

        socket.on('presence.update', handlePresenceUpdate);

        // Request an immediate update if needed or wait for the next broadcast
        // The gateway broadcasts on connection/join anyway.

        return () => {
            socket.off('presence.update', handlePresenceUpdate);
        };
    }, [socket, isConnected, activeProductionId]);

    return { members };
};
