import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { timelineService } from '../api/timeline.service';
import { useSocket } from '@/shared/socket/socket.provider';
import { CreateTimelineBlockDto, UpdateTimelineBlockDto } from '../types/timeline.types';

export const useTimeline = (productionId?: string) => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const query = useQuery({
        queryKey: ['timeline', productionId],
        queryFn: () => (productionId ? timelineService.getBlocks(productionId) : Promise.resolve([])),
        enabled: !!productionId,
    });

    // Real-time updates
    useEffect(() => {
        if (!socket || !productionId) return;

        const handleTimelineUpdate = (payload: { productionId: string }) => {
            if (payload.productionId === productionId) {
                queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
            }
        };

        socket.on('timeline.updated', handleTimelineUpdate);
        return () => {
            socket.off('timeline.updated', handleTimelineUpdate);
        };
    }, [socket, productionId, queryClient]);

    const createMutation = useMutation({
        mutationFn: (data: CreateTimelineBlockDto) =>
            timelineService.createBlock(productionId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTimelineBlockDto }) =>
            timelineService.updateBlock(productionId!, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => timelineService.deleteBlock(productionId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const startBlockMutation = useMutation({
        mutationFn: (id: string) => timelineService.startBlock(productionId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const completeBlockMutation = useMutation({
        mutationFn: (id: string) => timelineService.completeBlock(productionId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const resetBlockMutation = useMutation({
        mutationFn: (id: string) => timelineService.resetBlock(productionId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    const reorderMutation = useMutation({
        mutationFn: (blockIds: string[]) => timelineService.reorderBlocks(productionId!, blockIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        },
    });

    return {
        blocks: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        createBlock: createMutation.mutateAsync,
        updateBlock: updateMutation.mutateAsync,
        deleteBlock: deleteMutation.mutateAsync,
        startBlock: startBlockMutation.mutateAsync,
        completeBlock: completeBlockMutation.mutateAsync,
        resetBlock: resetBlockMutation.mutateAsync,
        reorderBlocks: reorderMutation.mutateAsync,
        isMutating:
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending ||
            startBlockMutation.isPending ||
            completeBlockMutation.isPending ||
            resetBlockMutation.isPending ||
            reorderMutation.isPending,
    };
};
