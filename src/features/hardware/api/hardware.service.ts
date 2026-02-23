import { apiClient } from '@/shared/api/api.client';

export interface HardwareMapping {
    id: string;
    productionId: string;
    mapKey: string;
    ruleId: string;
    rule?: any;
}

export const hardwareService = {
    getMappings: async (productionId: string): Promise<HardwareMapping[]> => {
        return (apiClient.get(`/productions/${productionId}/hardware/mappings`) as any);
    },

    saveMapping: async (productionId: string, mapKey: string, ruleId: string): Promise<HardwareMapping> => {
        return (apiClient.post(`/productions/${productionId}/hardware/mappings`, { mapKey, ruleId }) as any);
    },

    deleteMapping: async (productionId: string, mapKey: string): Promise<void> => {
        return (apiClient.delete(`/productions/${productionId}/hardware/mappings/${mapKey}`) as any);
    },
};
