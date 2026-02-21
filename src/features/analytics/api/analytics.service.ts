import { apiClient } from '@/shared/api/api.client';
import { DashboardMetrics, ProductionLog } from '../types/analytics.types';

export const analyticsService = {
    getDashboardMetrics: (productionId: string): Promise<DashboardMetrics> =>
        apiClient.get(`/productions/${productionId}/analytics/metrics`),

    getProductionLogs: (productionId: string): Promise<ProductionLog[]> =>
        apiClient.get(`/productions/${productionId}/analytics/logs`),

    getAllLogsForExport: (productionId: string): Promise<ProductionLog[]> =>
        apiClient.get(`/productions/${productionId}/analytics/logs/export`),
};
