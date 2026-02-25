import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { useSocket } from '@/shared/socket/socket.provider';
import { useEffect } from 'react';

export interface SocialMessage {
    id: string;
    productionId: string;
    platform: string;
    author: string;
    authorAvatar?: string;
    content: string;
    timestamp: Date | string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ON_AIR';
    aiSentiment?: string;
    aiCategory?: string;
}

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    isActive: boolean;
}

export const useSocial = (productionId: string) => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const { data: messages = [], isLoading: isMessagesLoading } = useQuery({
        queryKey: ['social-messages', productionId],
        queryFn: async () => {
            return apiClient.get<SocialMessage[]>(`/productions/${productionId}/social/messages`);
        },
        enabled: !!productionId,
    });

    const { data: activePoll = null, isLoading: isPollLoading } = useQuery({
        queryKey: ['active-poll', productionId],
        queryFn: async () => {
            return apiClient.get<Poll | null>(`/productions/${productionId}/social/polls/active`);
        },
        enabled: !!productionId,
    });

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: SocialMessage) => {
            if (msg.productionId === productionId) {
                queryClient.setQueryData(['social-messages', productionId], (old: SocialMessage[] = []) => {
                    return [msg, ...old];
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

        const handlePollCreated = (poll: Poll) => {
            queryClient.setQueryData(['active-poll', productionId], poll);
        };

        const handlePollUpdated = (poll: Poll) => {
            queryClient.setQueryData(['active-poll', productionId], poll);
        };

        const handlePollClosed = () => {
            queryClient.setQueryData(['active-poll', productionId], null);
        };

        socket.on('social.message.new', handleNewMessage);
        socket.on('social.message.updated', handleUpdatedMessage);
        socket.on('social.poll.created', handlePollCreated);
        socket.on('social.poll.updated', handlePollUpdated);
        socket.on('social.poll.closed', handlePollClosed);

        return () => {
            socket.off('social.message.new', handleNewMessage);
            socket.off('social.message.updated', handleUpdatedMessage);
            socket.off('social.poll.created', handlePollCreated);
            socket.off('social.poll.updated', handlePollUpdated);
            socket.off('social.poll.closed', handlePollClosed);
        };
    }, [socket, productionId, queryClient]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: SocialMessage['status'] }) => {
            return apiClient.put<{ success: boolean }>(`/productions/${productionId}/social/messages/${id}/status`, { status });
        },
    });

    const createPollMutation = useMutation({
        mutationFn: async ({ question, options }: { question: string, options: string[] }) => {
            return apiClient.post<Poll>(`/productions/${productionId}/social/polls`, { question, options });
        },
    });

    const votePollMutation = useMutation({
        mutationFn: async ({ pollId, optionId }: { pollId: string, optionId: string }) => {
            return apiClient.post<Poll>(`/productions/${productionId}/social/polls/${pollId}/vote`, { optionId });
        },
    });

    const closePollMutation = useMutation({
        mutationFn: async (pollId: string) => {
            return apiClient.delete<{ success: boolean }>(`/productions/${productionId}/social/polls/${pollId}`);
        },
    });

    return {
        messages,
        activePoll,
        isLoading: isMessagesLoading || isPollLoading,
        updateStatus: updateStatusMutation.mutateAsync,
        createPoll: createPollMutation.mutateAsync,
        votePoll: votePollMutation.mutateAsync,
        closePoll: closePollMutation.mutateAsync,
        pendingMessages: messages.filter((m: SocialMessage) => m.status === 'PENDING'),
        approvedMessages: messages.filter((m: SocialMessage) => m.status === 'APPROVED'),
        onAirMessage: messages.find((m: SocialMessage) => m.status === 'ON_AIR'),
    };
};
