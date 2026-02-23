import { apiClient } from '@/shared/api/api.client';
import { Rule } from '@/features/automation/types/automation.types';

export interface HardwareMapping {
    id: string;
    productionId: string;
    mapKey: string;
    ruleId: string;
    rule?: Rule;
}

export const hardwareService = {
    getMappings: async (productionId: string): Promise<HardwareMapping[]> => {
        return apiClient.get<HardwareMapping[]>(`/productions/${productionId}/hardware/mappings`);
    },

    saveMapping: async (productionId: string, mapKey: string, ruleId: string): Promise<HardwareMapping> => {
        return apiClient.post<HardwareMapping>(`/productions/${productionId}/hardware/mappings`, { mapKey, ruleId });
    },

    deleteMapping: async (productionId: string, mapKey: string): Promise<void> => {
        return apiClient.delete<void>(`/productions/${productionId}/hardware/mappings/${mapKey}`);
    },
};
