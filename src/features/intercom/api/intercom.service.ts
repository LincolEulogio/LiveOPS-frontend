import { apiClient } from '@/shared/api/api.client';

export interface IntercomTemplate {
    id: string;
    productionId: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommandTemplateDto {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}

export const intercomService = {
    getTemplates: async (productionId: string): Promise<IntercomTemplate[]> => {
        const response = await (apiClient.get(`/productions/${productionId}/intercom/templates`) as any);
        return response || [];
    },

    createTemplate: async (productionId: string, data: CreateCommandTemplateDto): Promise<IntercomTemplate> => {
        const response = await (apiClient.post(`/productions/${productionId}/intercom/templates`, data) as any);
        return response;
    },

    updateTemplate: async (productionId: string, id: string, data: CreateCommandTemplateDto): Promise<IntercomTemplate> => {
        const response = await (apiClient.put(`/productions/${productionId}/intercom/templates/${id}`, data) as any);
        return response;
    },

    deleteTemplate: async (productionId: string, id: string): Promise<void> => {
        await apiClient.delete(`/productions/${productionId}/intercom/templates/${id}`);
    }
};
