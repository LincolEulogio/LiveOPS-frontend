import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { timelineService } from '@/features/timeline/api/timeline.service';
import { useSocket } from '@/shared/socket/socket.provider';
import { CreateTimelineBlockDto, UpdateTimelineBlockDto } from '@/features/timeline/types/timeline.types';

export const useTimeline = (productionId?: string) => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();
    const [serverTimeOffset, setServerTimeOffset] = useState(0);

    const query = useQuery({
        queryKey: ['timeline', productionId],
        queryFn: () => (productionId ? timelineService.getBlocks(productionId) : Promise.resolve([])),
        enabled: !!productionId,
    });

    // Time Synchronization Logic
    useEffect(() => {
        if (!socket) return;

        const syncTime = () => {
            const start = Date.now();
            socket.emit('time.sync', {}, (response: { serverTime: string }) => {
                const end = Date.now();
                const latency = (end - start) / 2;
                const serverTime = new Date(response.serverTime).getTime();
                const offset = serverTime - (start + latency);
                setServerTimeOffset(offset);
                console.log(`[Timeline] Server time synced. Offset: ${offset}ms, Latency: ${latency}ms`);
            });
        };

        syncTime();
        const interval = setInterval(syncTime, 60000); // Re-sync every minute
        return () => clearInterval(interval);
    }, [socket]);

    // Real-time updates
    useEffect(() => {
        if (!socket || !productionId) return;

        socket.emit('production.join', { productionId });

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

    const createBlock = useCallback((data: CreateTimelineBlockDto) =>
        timelineService.createBlock(productionId!, data).then(() => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        }), [productionId, queryClient]);

    const updateBlock = useCallback(({ id, data }: { id: string; data: UpdateTimelineBlockDto }) =>
        timelineService.updateBlock(productionId!, id, data).then(() => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        }), [productionId, queryClient]);

    const deleteBlock = useCallback((id: string) =>
        timelineService.deleteBlock(productionId!, id).then(() => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        }), [productionId, queryClient]);

    const startBlock = useCallback((id: string) =>
        timelineService.startBlock(productionId!, id).then(() => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        }), [productionId, queryClient]);

    const completeBlock = useCallback((id: string) =>
        timelineService.completeBlock(productionId!, id).then(() => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        }), [productionId, queryClient]);

    const resetBlock = useCallback((id: string) =>
        timelineService.resetBlock(productionId!, id).then(() => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        }), [productionId, queryClient]);

    const reorderBlocks = useCallback((blockIds: string[]) =>
        timelineService.reorderBlocks(productionId!, blockIds).then(() => {
            queryClient.invalidateQueries({ queryKey: ['timeline', productionId] });
        }), [productionId, queryClient]);

    const isMutating = useMemo(() => false, []); // React Query mutations would be better but keeping it simple for now as requested

    return {
        blocks: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        serverTimeOffset,
        getCurrentServerTime: () => Date.now() + serverTimeOffset,
        createBlock,
        updateBlock,
        deleteBlock,
        startBlock,
        completeBlock,
        resetBlock,
        reorderBlocks,
        isMutating
    };
};
