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
        const response = await apiClient.get<IntercomTemplate[]>(`/productions/${productionId}/intercom/templates`);
        return response.data || [];
    },

    createTemplate: async (productionId: string, data: CreateCommandTemplateDto): Promise<IntercomTemplate> => {
        const response = await apiClient.post<IntercomTemplate>(`/productions/${productionId}/intercom/templates`, data);
        return response.data;
    },

    updateTemplate: async (productionId: string, id: string, data: CreateCommandTemplateDto): Promise<IntercomTemplate> => {
        const response = await apiClient.put<IntercomTemplate>(`/productions/${productionId}/intercom/templates/${id}`, data);
        return response.data;
    },

    deleteTemplate: async (productionId: string, id: string): Promise<void> => {
        await apiClient.delete(`/productions/${productionId}/intercom/templates/${id}`);
    }
};
