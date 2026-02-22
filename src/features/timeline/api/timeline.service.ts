import { apiClient } from '@/shared/api/api.client';
import {
    TimelineBlock,
    CreateTimelineBlockDto,
    UpdateTimelineBlockDto,
    ReorderBlocksDto
} from '../types/timeline.types';

export const timelineService = {
    getBlocks: async (productionId: string): Promise<TimelineBlock[]> => {
        const response = await apiClient.get<TimelineBlock[]>(`/productions/${productionId}/timeline`);
        return response.data;
    },

    createBlock: async (productionId: string, data: CreateTimelineBlockDto): Promise<TimelineBlock> => {
        const response = await apiClient.post<TimelineBlock>(`/productions/${productionId}/timeline`, data);
        return response.data;
    },

    updateBlock: async (productionId: string, id: string, data: UpdateTimelineBlockDto): Promise<TimelineBlock> => {
        const response = await apiClient.put<TimelineBlock>(`/productions/${productionId}/timeline/${id}`, data);
        return response.data;
    },

    deleteBlock: async (productionId: string, id: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete<{ success: boolean }>(`/productions/${productionId}/timeline/${id}`);
        return response.data;
    },

    reorderBlocks: async (productionId: string, blockIds: string[]): Promise<{ success: boolean }> => {
        const response = await apiClient.put<{ success: boolean }>(`/productions/${productionId}/timeline/reorder`, { blockIds });
        return response.data;
    },

    startBlock: async (productionId: string, id: string): Promise<TimelineBlock> => {
        const response = await apiClient.post<TimelineBlock>(`/productions/${productionId}/timeline/${id}/start`);
        return response.data;
    },

    completeBlock: async (productionId: string, id: string): Promise<TimelineBlock> => {
        const response = await apiClient.post<TimelineBlock>(`/productions/${productionId}/timeline/${id}/complete`);
        return response.data;
    },

    resetBlock: async (productionId: string, id: string): Promise<TimelineBlock> => {
        const response = await apiClient.post<TimelineBlock>(`/productions/${productionId}/timeline/${id}/reset`);
        return response.data;
    }
};
