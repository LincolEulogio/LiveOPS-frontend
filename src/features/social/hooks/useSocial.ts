import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/shared/socket/socket.provider';
import { useEffect } from 'react';

// Similar to backend type
export interface SocialMessage {
    id: string;
    productionId: string;
    platform: 'twitch' | 'youtube';
    author: string;
    avatarUrl?: string;
    content: string;
    timestamp: Date | string;
    status: 'pending' | 'approved' | 'rejected' | 'on-air';
}

export const useSocial = (productionId: string) => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['social-messages', productionId],
        queryFn: async () => {
            // In a real app we'd call axios.get(`/productions/${productionId}/social/messages`)
            // For now we simulate an empty array if no backend endpoint is fully hooked up to an axios client yet
            const res = await fetch(`http://localhost:3000/productions/${productionId}/social/messages`, {
                headers: {
                    // Need JWT token here in real app, we might rely on global interceptors if using axios instead
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) return [];
            return res.json() as Promise<SocialMessage[]>;
        },
        enabled: !!productionId,
    });

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: SocialMessage) => {
            if (msg.productionId === productionId) {
                queryClient.setQueryData(['social-messages', productionId], (old: SocialMessage[] = []) => {
                    return [...old, msg];
                });
            }
        };

        const handleUpdatedMessage = (msg: SocialMessage) => {
            if (msg.productionId === productionId) {
                queryClient.setQueryData(['social-messages', productionId], (old: SocialMessage[] = []) => {
                    return old.map(m => m.id === msg.id ? msg : m);
                });
            }
        };

        socket.on('social.message.new', handleNewMessage);
        socket.on('social.message.updated', handleUpdatedMessage);

        return () => {
            socket.off('social.message.new', handleNewMessage);
            socket.off('social.message.updated', handleUpdatedMessage);
        };
    }, [socket, productionId, queryClient]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: SocialMessage['status'] }) => {
            const res = await fetch(`http://localhost:3000/productions/${productionId}/social/messages/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        // Optimistic update could go here
    });

    return {
        messages,
        isLoading,
        updateStatus: updateStatusMutation.mutateAsync,
        pendingMessages: messages.filter(m => m.status === 'pending'),
        approvedMessages: messages.filter(m => m.status === 'approved'),
        onAirMessage: messages.find(m => m.status === 'on-air'),
    };
};
