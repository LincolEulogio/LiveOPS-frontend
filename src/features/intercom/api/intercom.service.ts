import { apiClient } from '@/shared/api/api.client';
import { IntercomTemplate, CreateCommandTemplateDto } from '../types/intercom.types';

export const intercomService = {
    getTemplates: async (productionId: string): Promise<IntercomTemplate[]> => {
        const response = await apiClient.get<IntercomTemplate[]>(`/productions/${productionId}/intercom/templates`);
        return response || [];
    },

    createTemplate: async (productionId: string, data: CreateCommandTemplateDto): Promise<IntercomTemplate> => {
        return apiClient.post<IntercomTemplate>(`/productions/${productionId}/intercom/templates`, data);
    },

    updateTemplate: async (productionId: string, id: string, data: CreateCommandTemplateDto): Promise<IntercomTemplate> => {
        return apiClient.put<IntercomTemplate>(`/productions/${productionId}/intercom/templates/${id}`, data);
    },

    deleteTemplate: async (productionId: string, id: string): Promise<void> => {
        await apiClient.delete(`/productions/${productionId}/intercom/templates/${id}`);
    }
};
