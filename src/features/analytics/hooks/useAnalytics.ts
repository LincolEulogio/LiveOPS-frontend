import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/features/analytics/api/analytics.service';
import { useSocket } from '@/shared/socket/socket.provider';
import { useEffect, useState } from 'react';
import { ProductionLog } from '@/features/analytics/types/analytics.types';

export const useAnalytics = (productionId: string) => {
    const { socket } = useSocket();
    const [liveLogs, setLiveLogs] = useState<ProductionLog[]>([]);

    // 1. Fetch historical metrics
    const { data: metrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useQuery({
        queryKey: ['analytics-metrics', productionId],
        queryFn: () => analyticsService.getDashboardMetrics(productionId),
        enabled: !!productionId,
        refetchInterval: 30000, // Refresh metrics every 30s
    });

    // 2. Fetch historical logs
    const { data: historicalLogs = [], isLoading: isLoadingLogs } = useQuery({
        queryKey: ['production-logs', productionId],
        queryFn: () => analyticsService.getProductionLogs(productionId),
        enabled: !!productionId,
    });

    // 3. Listen for live events via WebSockets to update the feed in real-time
    useEffect(() => {
        if (!socket || !productionId) return;

        // We listen to a generic log event or specific domain events
        // Ideally the backend emits a 'production.log' for analytics purposes
        const handleNewLog = (log: ProductionLog) => {
            if (log.productionId === productionId) {
                setLiveLogs((prev) => [log, ...prev].slice(0, 100));
                // Also trigger a metrics refresh on significant events
                refetchMetrics();
            }
        };

        socket.on('analytics.log', handleNewLog);

        return () => {
            socket.off('analytics.log', handleNewLog);
        };
    }, [socket, productionId, refetchMetrics]);

    const allLogs = [...liveLogs, ...historicalLogs].filter(
        (log, index, self) => index === self.findIndex((t) => t.id === log.id)
    );

    return {
        metrics,
        logs: allLogs,
        isLoading: isLoadingMetrics || isLoadingLogs,
        refetchMetrics,
    };
};
