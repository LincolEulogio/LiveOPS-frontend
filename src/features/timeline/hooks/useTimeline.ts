import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelineService } from '../api/timeline.service';
import { useSocket } from '@/shared/socket/socket.provider';
import { useEffect } from 'react';
import {
    CreateTimelineBlockDto,
    UpdateTimelineBlockDto,
    TimelineBlock,
} from '../types/timeline.types';

export const useTimeline = (productionId: string) => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    // 1. Fetch blocks
    const { data: blocks = [], isLoading, error } = useQuery({
        queryKey: ['timeline', productionId],
        queryFn: () => timelineService.getBlocks(productionId),
        enabled: !!productionId,
    });

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: (dto: CreateTimelineBlockDto) => timelineService.createBlock(productionId, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateTimelineBlockDto }) =>
            timelineService.updateBlock(productionId, id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => timelineService.deleteBlock(productionId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const reorderMutation = useMutation({
        mutationFn: (blockIds: string[]) => timelineService.reorderBlocks(productionId, blockIds),
        // Optimistic update for reordering
        onMutate: async (blockIds) => {
            await queryClient.cancelQueries({ queryKey: ['timeline', productionId] });
            const previousBlocks = queryClient.getQueryData<TimelineBlock[]>(['timeline', productionId]);

            if (previousBlocks) {
                const reordered = blockIds.map((id, index) => {
                    const block = previousBlocks.find((b) => b.id === id);
                    return block ? { ...block, order: index } : null;
                }).filter(Boolean) as TimelineBlock[];

                queryClient.setQueryData(['timeline', productionId], reordered);
            }

            return { previousBlocks };
        },
        onError: (err, newBlockIds, context) => {
            if (context?.previousBlocks) {
                queryClient.setQueryData(['timeline', productionId], context.previousBlocks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const startMutation = useMutation({
        mutationFn: (id: string) => timelineService.startBlock(productionId, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeline', productionId] }),
    });

    const completeMutation = useMutation({
        mutationFn: (id: string) => timelineService.completeBlock(productionId, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeline', productionId] }),
    });

    const resetMutation = useMutation({
        mutationFn: (id: string) => timelineService.resetBlock(productionId, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeline', productionId] }),
    });

    // 3. WebSocket Real-time Sync
    useEffect(() => {
        if (!socket) return;

        const handleTimelineUpdated = (payload: { productionId: string }) => {
            if (payload.productionId === productionId) {
                console.log('Timeline updated via WS, invalidating queries...');
                queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
            }
        };

        socket.on('timeline.updated', handleTimelineUpdated);

        return () => {
            socket.off('timeline.updated', handleTimelineUpdated);
        };
    }, [socket, productionId, queryClient]);

    return {
        blocks,
        isLoading,
        error,
        createBlock: createMutation.mutateAsync,
        updateBlock: updateMutation.mutateAsync,
        deleteBlock: deleteMutation.mutateAsync,
        reorderBlocks: reorderMutation.mutateAsync,
        startBlock: startMutation.mutateAsync,
        completeBlock: completeMutation.mutateAsync,
        resetBlock: resetMutation.mutateAsync,
        isMutating:
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending ||
            reorderMutation.isPending ||
            startMutation.isPending ||
            completeMutation.isPending ||
            resetMutation.isPending,
    };
};
