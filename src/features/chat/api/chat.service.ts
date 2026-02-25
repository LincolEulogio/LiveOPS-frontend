import { apiClient } from '@/shared/api/api.client';
import { Command, CommandTemplate, ChatMessage } from '@/features/chat/types/chat.types';

export const chatService = {
    getCommandHistory: (productionId: string, limit: number = 50): Promise<Command[]> =>
        apiClient.get(`/productions/${productionId}/intercom/history`, { params: { limit } }),

    getTemplates: (productionId: string): Promise<CommandTemplate[]> =>
        apiClient.get(`/productions/${productionId}/intercom/templates`),

    createTemplate: (
        productionId: string,
        dto: Omit<CommandTemplate, 'id' | 'productionId' | 'createdAt' | 'updatedAt'>
    ): Promise<CommandTemplate> =>
        apiClient.post(`/productions/${productionId}/intercom/templates`, dto),

    deleteTemplate: (productionId: string, templateId: string): Promise<{ success: boolean }> =>
        apiClient.delete(`/productions/${productionId}/intercom/templates/${templateId}`),

    getChatHistory: (productionId: string, limit: number = 100): Promise<ChatMessage[]> =>
        apiClient.get(`/chats/${productionId}`, { params: { limit } }),
};
