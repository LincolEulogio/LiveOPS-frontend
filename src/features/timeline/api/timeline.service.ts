import { apiClient } from '@/shared/api/api.client';
import {
    TimelineBlock,
    CreateTimelineBlockDto,
    UpdateTimelineBlockDto,
    ReorderBlocksDto
} from '../types/timeline.types';

export const timelineService = {
    getBlocks: async (productionId: string): Promise<TimelineBlock[]> => {
        return apiClient.get(`/productions/${productionId}/timeline`);
    },

    createBlock: async (productionId: string, data: CreateTimelineBlockDto): Promise<TimelineBlock> => {
        return apiClient.post(`/productions/${productionId}/timeline`, data);
    },

    updateBlock: async (productionId: string, id: string, data: UpdateTimelineBlockDto): Promise<TimelineBlock> => {
        return apiClient.put(`/productions/${productionId}/timeline/${id}`, data);
    },

    deleteBlock: async (productionId: string, id: string): Promise<{ success: boolean }> => {
        return apiClient.delete(`/productions/${productionId}/timeline/${id}`);
    },

    reorderBlocks: async (productionId: string, blockIds: string[]): Promise<{ success: boolean }> => {
        return apiClient.put(`/productions/${productionId}/timeline/reorder`, { blockIds });
    },

    startBlock: async (productionId: string, id: string): Promise<TimelineBlock> => {
        return apiClient.post(`/productions/${productionId}/timeline/${id}/start`);
    },

    completeBlock: async (productionId: string, id: string): Promise<TimelineBlock> => {
        return apiClient.post(`/productions/${productionId}/timeline/${id}/complete`);
    },

    resetBlock: async (productionId: string, id: string): Promise<TimelineBlock> => {
        return apiClient.post(`/productions/${productionId}/timeline/${id}/reset`);
    },
};
