import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
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
            return (await apiClient.get<SocialMessage[]>(`/productions/${productionId}/social/messages`)) as any;
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
            return apiClient.put(`/productions/${productionId}/social/messages/${id}/status`, { status }) as any;
        },
        // Optimistic update could go here
    });

    return {
        messages,
        isLoading,
        updateStatus: updateStatusMutation.mutateAsync,
        pendingMessages: messages.filter((m: SocialMessage) => m.status === 'pending'),
        approvedMessages: messages.filter((m: SocialMessage) => m.status === 'approved'),
        onAirMessage: messages.find((m: SocialMessage) => m.status === 'on-air'),
    };
};
