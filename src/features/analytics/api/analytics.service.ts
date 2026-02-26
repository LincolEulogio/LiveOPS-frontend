import { apiClient } from '@/shared/api/api.client';
import { DashboardMetrics, ProductionLog } from '@/features/analytics/types/analytics.types';

export const analyticsService = {
    getDashboardMetrics: (productionId: string): Promise<DashboardMetrics> =>
        apiClient.get(`/productions/${productionId}/analytics/metrics`),

    getProductionLogs: (productionId: string): Promise<ProductionLog[]> =>
        apiClient.get(`/audit/production/${productionId}`),

    getAllLogsForExport: (productionId: string): Promise<ProductionLog[]> =>
        apiClient.get(`/audit/production/${productionId}?limit=1000`),

    getGlobalAuditLogs: (page: number = 1): Promise<ProductionLog[]> =>
        apiClient.get(`/audit/global?page=${page}`),
};
